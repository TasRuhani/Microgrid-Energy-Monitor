'use client';
import React from 'react';
import { Card, Button, Input, Label } from '@/components/ui';

interface ConfigPageProps {
  esp32Ip: string;
  setEsp32Ip: (ip: string) => void;
  ssid: string;
  setSsid: (ssid: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSave: () => void;
}

export const ConfigPage = ({ esp32Ip, setEsp32Ip, ssid, setSsid, password, setPassword, onSave }: ConfigPageProps) => (
  <Card className="max-w-md my-20 mx-auto">
    <h2 className="text-xl font-bold mb-4 text-center">Configure ESP32 Connection</h2>
    <div className="mb-4">
      <Label htmlFor="ip">ESP32 IP Address</Label>
      <Input
        id="ip"
        placeholder="10.245.117.161"
        value={esp32Ip}
        onChange={(e) => setEsp32Ip(e.target.value)}
      />
    </div>
    <div className="mb-4">
      <Label htmlFor="ssid">Wi-Fi SSID</Label>
      <Input
        id="ssid"
        placeholder="Your Wi-Fi Name"
        value={ssid}
        onChange={(e) => setSsid(e.target.value)}
      />
    </div>
    <div className="mb-4">
      <Label htmlFor="password">Wi-Fi Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="Your Wi-Fi Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
    <div className="text-center">
      <Button onClick={onSave} className="w-full" variant="primary">
        Save Settings
      </Button>
    </div>
    <p className="text-xs text-slate-500 mt-4 text-center">
      Note: The Wi-Fi settings are saved locally in your browser. They are not sent to a server.
      The app connects to the ESP32 using the IP address you provide here.
    </p>
  </Card>
);
