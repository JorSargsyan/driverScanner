const license =
  'ewogICJsaWNlbnNlS2V5VmVyc2lvbiI6ICIzLjAiLAogICJkZWJ1Z1JlcG9ydGluZyI6ICJvbiIsCiAgIm1ham9yVmVyc2lvbiI6ICIzNyIsCiAgInNjb3BlIjogWwogICAgIkFMTCIKICBdLAogICJtYXhEYXlzTm90UmVwb3J0ZWQiOiAzMCwKICAiYWR2YW5jZWRCYXJjb2RlIjogdHJ1ZSwKICAibXVsdGlCYXJjb2RlIjogdHJ1ZSwKICAic3VwcG9ydGVkQmFyY29kZUZvcm1hdHMiOiBbCiAgICAiQUxMIgogIF0sCiAgInBsYXRmb3JtIjogWwogICAgImlPUyIsCiAgICAiQW5kcm9pZCIKICBdLAogICJzaG93V2F0ZXJtYXJrIjogdHJ1ZSwKICAidG9sZXJhbmNlRGF5cyI6IDMwLAogICJ2YWxpZCI6ICIyMDIzLTEyLTMxIiwKICAiaW9zSWRlbnRpZmllciI6IFsKICAgICJpby5hbnlsaW5lLmV4YW1wbGVzIiwKICAgICJpby5hbnlsaW5lLmV4YW1wbGVzLnN0b3JlIiwKICAgICJpby5hbnlsaW5lLmV4YW1wbGVzLmJ1bmRsZSIsCiAgICAiaW8uYW55bGluZS5BbnlsaW5lRXhhbXBsZXMiLAogICAgImlvLmFueWxpbmUuQW55bGluZUV4YW1wbGVzLmJldGEiLAogICAgImlvLmFueWxpbmUuQW55bGluZUV4YW1wbGVzLnRlc3QiCiAgXSwKICAiYW5kcm9pZElkZW50aWZpZXIiOiBbCiAgICAiaW8uYW55bGluZS5leGFtcGxlcyIsCiAgICAiaW8uYW55bGluZS5leGFtcGxlcy5zdG9yZSIsCiAgICAiaW8uYW55bGluZS5leGFtcGxlcy5idW5kbGUiLAogICAgImlvLmFueWxpbmUuQW55bGluZUV4YW1wbGVzIiwKICAgICJpby5hbnlsaW5lLkFueWxpbmVFeGFtcGxlcy5iZXRhIgogIF0KfQpvVEwrNXkxTkdlc1M2alM3OXZEcjhNanlGOXZKOEhDTWVtcjdRZkN6eVRudUp1aGM5dlFrN2RRWUtHOXhlcTVFOEtyRzBOa2ZoU0RXOWtHcVhnZndTNy9QejdCZllXWXBSNzFySVllL0Z0c2tQT3JhaEhZWlhqcjhLR2RxRzZrTnc3WlovOGF0cTZNQ0p1cURiT3Z1TSsxd09CUG05U0VXK0FRRXJVcWU2UlBvQ0dicmdwUGxLdGh3N1BLUUt4dHl1L01mYzltbG16TkxMQkdLNzVzYnRxdnMvc2VXV1JtSGo5c3ltU1lVSFlxeHZEVmNqV0xMS1p3amdsMTUrZ3g2b3lHaDdhVmlPSEVDd2dVNlhFSWNsM3ExTjZ1OXg1VWZyYklKUTRiYWxkMHlPci9FL24zQlNMTndVWFpyZ0J0RnJMcUd2SVFwd1NDMHVMQzV5b1dJRlE9PQ';

const BarcodeBundleConfig = {
  license,
  options: {
    camera: {
      captureResolution: '1080p',
      zoomGesture: true,
    },
    multiScanButton: {
      offset: {
        x: 250,
        y: 1100,
      },
    },
    flash: {
      mode: 'manual',
      alignment: 'bottom_right',
    },
    viewPlugin: {
      plugin: {
        id: 'Barcode_ID',
        barcodePlugin: {
          barcodeFormatOptions: ['CODE_128'],
          enablePDF417Parsing: true,
          multiBarcode: true,
          nativeBarcodeEnabled: true,
        },
      },
      cutoutConfig: {
        style: 'rect',
        maxWidthPercent: '80%',
        maxHeightPercent: '100%',
        alignment: 'center',
        width: 10000,
        ratioFromSize: {
          width: 100,
          height: 200,
        },
        strokeWidth: 1,
        cornerRadius: 3,
        strokeColor: 'FFFFFF',
        outerColor: '000000',
        outerAlpha: 0.3,
        feedbackStrokeColor: '0099FF',
      },
      scanFeedback: {
        style: 'rect',
        strokeColor: '0099FF',
        fillColor: '220099FF',
        animationDuration: 150,
        blinkOnResult: true,
        beepOnResult: true,
        vibrateOnResult: true,
        reportingEnabled: true,
      },
      cancelOnResult: false,
    },
  },
};

const BarcodeShipmentConfig = {
  license,
  options: {
    camera: {
      captureResolution: '1080p',
      zoomGesture: true,
    },
    flash: {
      mode: 'manual',
      alignment: 'bottom_right',
    },
    viewPlugin: {
      plugin: {
        id: 'Barcode_ID',
        barcodePlugin: {
          barcodeFormatOptions: ['CODE_128'],
          enablePDF417Parsing: true,
        },
      },
      cutoutConfig: {
        style: 'rect',
        maxWidthPercent: '80%',
        maxHeightPercent: '100%',
        alignment: 'center',
        width: 700,
        ratioFromSize: {
          width: 700,
          height: 400,
        },
        strokeWidth: 1,
        cornerRadius: 3,
        strokeColor: 'FFFFFF',
        outerColor: '000000',
        outerAlpha: 0.3,
        feedbackStrokeColor: '0099FF',
      },
      scanFeedback: {
        style: 'rect',
        strokeColor: '0099FF',
        fillColor: '220099FF',
        animationDuration: 150,
        blinkOnResult: true,
        beepOnResult: true,
        vibrateOnResult: true,
        reportingEnabled: true,
      },
      cancelOnResult: true,
    },
  },
};

export {BarcodeBundleConfig, BarcodeShipmentConfig};
