import { useState, useCallback } from 'react';

const VID = 0xFEED, PID = 0x6536, USAGE_PAGE = 0xFF60, USAGE = 0x61;

export function useWebHID() {
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const [dev] = await navigator.hid.requestDevice({
        filters: [{ vendorId: VID, productId: PID, usagePage: USAGE_PAGE, usage: USAGE }]
      });
      if (!dev) return;
      await dev.open();
      setDevice(dev);
      setConnected(true);
    } catch (e) { setError(e.message); }
  }, []);

  const disconnect = useCallback(async () => {
    if (!device) return;
    await device.close();
    setDevice(null);
    setConnected(false);
  }, [device]);

  const send = useCallback(async (data) => {
    if (!device || !connected) return null;
    const buf = new Uint8Array(32);
    buf.set(data);
    await device.sendReport(0x00, buf);
    return new Promise(resolve => {
      const h = e => { device.removeEventListener('inputreport', h); resolve(new Uint8Array(e.data.buffer)); };
      device.addEventListener('inputreport', h);
      setTimeout(() => { device.removeEventListener('inputreport', h); resolve(null); }, 1000);
    });
  }, [device, connected]);

  const remapKey = useCallback(async (row, col, keycode) => {
    await send([0x01, row, col, keycode & 0xFF, (keycode >> 8) & 0xFF]);
  }, [send]);

  const getStats = useCallback(async () => {
    const res = await send([0x02]);
    if (!res) return null;
    return { layer: res[1], uptime: res[2] | (res[3] << 8) };
  }, [send]);

  return { connected, error, connect, disconnect, remapKey, getStats };
}