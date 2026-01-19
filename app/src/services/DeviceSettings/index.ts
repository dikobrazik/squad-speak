export class InputDeviceChangedEvent extends Event {
  public static type: "input-device-changed";
  public deviceId: string | undefined;

  constructor(deviceId: string | undefined) {
    super(InputDeviceChangedEvent.type);

    this.deviceId = deviceId;
  }
}

class DeviceSettingsService extends EventTarget {
  resetAudioInputDevice() {
    this.dispatchEvent(new InputDeviceChangedEvent(undefined));
    localStorage.removeItem("audioInputDeviceId");
  }

  setAudioInputDevice(deviceId: string) {
    this.dispatchEvent(new InputDeviceChangedEvent(deviceId));
    localStorage.setItem("audioInputDeviceId", deviceId);
  }

  getAudioInputDevice(): string | null {
    return localStorage.getItem("audioInputDeviceId");
  }

  setAudioOutputDevice(deviceId: string) {
    localStorage.setItem("audioOutputDeviceId", deviceId);
  }

  getAudioOutputDevice(): string | null {
    return localStorage.getItem("audioOutputDeviceId");
  }

  // @ts-expect-error method override
  addEventListener(
    _type: (typeof InputDeviceChangedEvent)["type"],
    callback: ((event: InputDeviceChangedEvent) => void) | null,
  ): void {
    super.addEventListener(InputDeviceChangedEvent.type, (event) => {
      if (callback) {
        callback(event as InputDeviceChangedEvent);
      }
    });
  }
}

export const deviceSettingsService = new DeviceSettingsService();
