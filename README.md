## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The main.ino file to be flashed into the ESP32

```bash
/*
 * Project: PZEM-004t v4.0 with ESP32, 16x2 I2C LCD, and Web UI
 * Description: This sketch reads AC Voltage, Current, Power, Energy, Power Factor,
 * and calculates Apparent and Reactive Power. It serves the data on a modern,
 * auto-updating web page and also cycles it on a 16x2 I2C LCD.
 *
 * Date: 12 September 2025
 *
 * --- WIRING for ESP32 Dev Board ---
 * - PZEM TX -> ESP32 Pin 16 (RX2)
 * - PZEM RX -> ESP32 Pin 17 (TX2)
 * - LCD SDA -> ESP32 Pin 21 (SDA)
 * - LCD SCL -> ESP32 Pin 22 (SCL)
 * - Ensure a common GND between ESP32, PZEM, and LCD power.
 */

// --- Include necessary libraries ---
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <PZEM004Tv30.h>
#include <LiquidCrystal_I2C.h>
#include <math.h>

// --- Configuration ---

// ** IMPORTANT: Enter your WiFi credentials here **
const char* ssid = "Wi-Fi SSID";
const char* password = "password";

// Configure the I2C address for the 16x2 LCD 
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Use Hardware Serial 2 for PZEM communication 
HardwareSerial pzemSerial(2);
PZEM004Tv30 pzem(pzemSerial, 16, 17);

// Create an AsyncWebServer object on port 80
AsyncWebServer server(80);

// --- Global Variables to hold sensor data ---
float voltage = 0.0;
float current = 0.0;
float power = 0.0;       // Real Power
float energy = 0.0;
float pf = 0.0;
float apparentPower = 0.0;
float reactivePower = 0.0;

// Variable for cycling LCD screen
int displayScreen = 0;

// --- Functions ---

void getPzemData() {
  voltage = pzem.voltage();
  delay(200);
  current = pzem.current();
  delay(200);
  power = pzem.power();
  delay(200);
  energy = pzem.energy();
  delay(200);
  pf = pzem.pf();
  
  // Check if any reading failed (library returns NaN)
  if (isnan(voltage) || isnan(current) || isnan(power) || isnan(energy) || isnan(pf)) {
    Serial.println("Error reading from PZEM. Check wiring.");
    voltage = current = power = energy = pf = apparentPower = reactivePower = 0.0;
    return;
  }

  // --- Calculations ---
  apparentPower = voltage * current;
  if (apparentPower < power) {
      reactivePower = 0;
  } else {
      reactivePower = sqrt(pow(apparentPower, 2) - pow(power, 2));
  }
}

void printToSerial() {
  Serial.println("--------------------");
  Serial.printf("Voltage:         %.1f V\n", voltage);
  Serial.printf("Current:         %.2f A\n", current);
  Serial.printf("Real Power:      %.1f W\n", power);
  Serial.printf("Apparent Power:  %.1f VA\n", apparentPower);
  Serial.printf("Reactive Power:  %.1f VAR\n", reactivePower);
  Serial.printf("Power Factor:    %.2f\n", pf);
  Serial.printf("Energy:          %.0f Wh\n", energy * 1000);
  Serial.println("--------------------");
}

void updateLcd() {
  lcd.clear();
  switch(displayScreen) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.printf("V: %.1f", voltage);
      lcd.setCursor(9, 0);
      lcd.printf("I: %.2f", current);
      lcd.setCursor(0, 1);
      lcd.printf("Energy: %.0fWh", energy * 1000);
      break;
    case 1:
      lcd.setCursor(0, 0);
      lcd.printf("Real P: %.1f W", power);
      lcd.setCursor(0, 1);
      lcd.printf("Apprnt P: %.1f VA", apparentPower);
      break;
    case 2:
      lcd.setCursor(0, 0);
      lcd.printf("React P: %.1fVAR", reactivePower);
      lcd.setCursor(0, 1);
      lcd.printf("P Factor: %.2f", pf);
      break;
  }
  displayScreen = (displayScreen + 1) % 3;
}

void setup() {
  Serial.begin(115200);
  Serial.println("\nESP32 PZEM-004t Energy Monitor");
  pzemSerial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Energy Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Web Interface:");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  delay(3000);

  // --- Define Web Server Routes ---

  // Route to get current sensor data as JSON
  server.on("/data", HTTP_GET, [](AsyncWebServerRequest *request){
    // Add the CORS header to the response
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    response->addHeader("Access-Control-Allow-Origin", "*");
    
    StaticJsonDocument<256> doc;
    doc["voltage"] = voltage;
    doc["current"] = current;
    doc["power"] = power;
    doc["energy"] = energy;
    doc["pf"] = pf;
    doc["apparentPower"] = apparentPower;
    doc["reactivePower"] = reactivePower;
    
    serializeJson(doc, *response);
    
    request->send(response);
  });

  // Route to reset the energy counter
  server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    // Add the CORS header to the response
    AsyncResponseStream *response = request->beginResponseStream("text/plain");
    response->addHeader("Access-Control-Allow-Origin", "*");

    if (pzem.resetEnergy()) {
      response->print("Energy counter reset successfully!");
    } else {
      response->print("Failed to reset energy counter.");
    }
    request->send(response);
  });

  // Start the server
  server.begin();
  Serial.println("Web server started.");
  
  // Attempt to reset the energy counter on boot
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Resetting Energy");
  if(pzem.resetEnergy()){
    Serial.println("Energy counter has been successfully reset.");
    lcd.setCursor(0, 1);
    lcd.print("Reset OK!");
  } else {
    Serial.println("Failed to reset energy counter. Check wiring.");
    lcd.setCursor(0, 1);
    lcd.print("Reset Failed!");
  }
  delay(2000);
}

void loop() {
  getPzemData();
  printToSerial();
  updateLcd();
  delay(3000);
}
```