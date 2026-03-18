// widgets/Volume.tsx
import { Gtk } from "ags/gtk4";
import { createState, onCleanup, With, createBinding, createEffect } from "ags";
import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import AstalWp from "gi://AstalWp?version=0.1";
import Gio from "gi://Gio";

/* ─────────────────────────────────────────────
   GET WIREPLUMBER INSTANCE
───────────────────────────────────────────── */

const wp = AstalWp.get_default();
const audio = wp?.audio;

/* ─────────────────────────────────────────────
   STATIC CSS STYLES
───────────────────────────────────────────── */

const STYLES = {
  controlBox: `
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px;
  `,
  controlBoxMuted: `
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 100, 100, 0.19);
    border-radius: 14px;
    padding: 16px;
  `,
  muteButton: `
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 10px;
    padding: 8px;
    min-width: 44px;
    min-height: 44px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.19);
  `,
  muteButtonMuted: `
    background: linear-gradient(to bottom, rgba(255, 100, 100, 0.25), rgba(255, 100, 100, 0.13));
    border: 1px solid rgba(255, 100, 100, 0.38);
    border-radius: 10px;
    padding: 8px;
    min-width: 44px;
    min-height: 44px;
    box-shadow: 0 2px 8px rgba(255, 100, 100, 0.19);
  `,
  iconNormal: "font-size: 22px; color: #7aa2f7;",
  iconGreen: "font-size: 22px; color: #9ece6a;",
  iconRed: "font-size: 22px; color: #ff6464;",
  volumeBadge: `
    background: rgba(122, 162, 247, 0.13);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 56px;
  `,
  volumeBadgeMuted: `
    background: rgba(255, 100, 100, 0.13);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 56px;
  `,
  volumeBadgeGreen: `
    background: rgba(158, 206, 106, 0.13);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 56px;
  `,
  volumeLabel:
    "font-size: 18px; font-weight: 700; color: rgba(255, 255, 255, 0.92);",
  volumeLabelMuted: "font-size: 18px; font-weight: 700; color: #ff6464;",
  statusActive: "font-size: 10px; color: #9ece6a;",
  statusMuted: "font-size: 10px; color: #ff6464;",
  presetButton: `
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 8px 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.13);
  `,
  presetButtonActive: `
    background: linear-gradient(to bottom, rgba(122, 162, 247, 0.31), rgba(122, 162, 247, 0.19));
    border: 1px solid rgba(122, 162, 247, 0.38);
    border-radius: 8px;
    padding: 8px 4px;
    box-shadow: 0 2px 10px rgba(122, 162, 247, 0.25);
  `,
  presetLabel:
    "font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.5);",
  presetLabelActive: "font-size: 11px; font-weight: 700; color: #7aa2f7;",
  presetLabelActiveRed: "font-size: 11px; font-weight: 700; color: #ff6464;",
  streamBox: `
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 12px;
  `,
  streamBoxMuted: `
    background: rgba(255, 100, 100, 0.08);
    border: 1px solid rgba(255, 100, 100, 0.25);
    border-radius: 10px;
    padding: 12px;
  `,
  streamMuteButton: `
    background: linear-gradient(to bottom, rgba(187, 154, 247, 0.19), rgba(187, 154, 247, 0.08));
    border: 1px solid rgba(187, 154, 247, 0.31);
    border-radius: 8px;
    padding: 6px;
    min-width: 36px;
    min-height: 36px;
    box-shadow: 0 2px 6px rgba(187, 154, 247, 0.19);
  `,
  streamMuteButtonMuted: `
    background: linear-gradient(to bottom, rgba(255, 100, 100, 0.25), rgba(255, 100, 100, 0.13));
    border: 1px solid rgba(255, 100, 100, 0.38);
    border-radius: 8px;
    padding: 6px;
    min-width: 36px;
    min-height: 36px;
    box-shadow: 0 2px 6px rgba(255, 100, 100, 0.19);
  `,
  streamIconPurple: "font-size: 16px; color: #bb9af7;",
  streamIconRed: "font-size: 16px; color: #ff6464;",
  streamVolumeLabel:
    "font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.92); min-width: 44px;",
  streamVolumeLabelMuted:
    "font-size: 12px; font-weight: 700; color: #ff6464; min-width: 44px;",
  popup: `
    background: linear-gradient(to bottom, rgba(28, 40, 38, 0.95), rgba(18, 28, 26, 0.95));
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 20px;
    min-width: 420px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
  `,
  barButton: `
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 4px 10px;
    margin: 0 2px;
  `,
  barIcon: "font-size: 16px; color: #7aa2f7;",
  barIconMuted: "font-size: 16px; color: #ff6464;",
  barValue:
    "font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.92);",
  barValueMuted: "font-size: 12px; font-weight: 600; color: #ff6464;",
};

/* ─────────────────────────────────────────────
   VOLUME CONTROL COMPONENT
───────────────────────────────────────────── */

function VolumeControl({
  node,
  label,
  icon,
  iconMuted,
  accentColor = "blue",
}: {
  node: AstalWp.Node;
  label: string;
  icon: string;
  iconMuted: string;
  accentColor?: "blue" | "green";
}) {
  const volumeBinding = createBinding(node, "volume");
  const mutedBinding = createBinding(node, "mute");

  let isDragging = false;
  let sliderRef: Gtk.Scale | null = null;

  function handleMuteToggle(): void {
    node.mute = !node.mute;
  }

  function handleVolumeSet(value: number): void {
    node.volume = Math.max(0, Math.min(1.5, value / 100));
  }

  // Sync slider when volume changes externally (but not while dragging)
  const volumeHandler = node.connect("notify::volume", () => {
    if (!isDragging && sliderRef) {
      const newVal = Math.round(node.volume * 100);
      if (Math.abs(sliderRef.get_value() - newVal) > 0.5) {
        sliderRef.set_value(newVal);
      }
    }
  });

  onCleanup(() => {
    node.disconnect(volumeHandler);
  });

  const iconStyle =
    accentColor === "green" ? STYLES.iconGreen : STYLES.iconNormal;
  const badgeStyle =
    accentColor === "green" ? STYLES.volumeBadgeGreen : STYLES.volumeBadge;

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      {/* Use With to conditionally render based on muted state */}
      <With value={mutedBinding}>
        {(isMuted) => (
          <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
            css={isMuted ? STYLES.controlBoxMuted : STYLES.controlBox}
          >
            {/* Header */}
            <box spacing={12}>
              <button
                css={isMuted ? STYLES.muteButtonMuted : STYLES.muteButton}
                onClicked={handleMuteToggle}
                tooltipText={isMuted ? "Unmute" : "Mute"}
              >
                <label
                  label={isMuted ? iconMuted : icon}
                  css={isMuted ? STYLES.iconRed : iconStyle}
                />
              </button>

              <box
                orientation={Gtk.Orientation.VERTICAL}
                hexpand
                valign={Gtk.Align.CENTER}
              >
                <label
                  label={label}
                  halign={Gtk.Align.START}
                  css="font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.92);"
                  ellipsize={3}
                />
                <label
                  label={isMuted ? "Muted" : "Active"}
                  halign={Gtk.Align.START}
                  css={isMuted ? STYLES.statusMuted : STYLES.statusActive}
                />
              </box>

              <box
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
                css={isMuted ? STYLES.volumeBadgeMuted : badgeStyle}
              >
                <label
                  label={volumeBinding((v) => `${Math.round(v * 100)}%`)}
                  css={isMuted ? STYLES.volumeLabelMuted : STYLES.volumeLabel}
                />
              </box>
            </box>

            {/* Slider */}
            <Gtk.Scale
              orientation={Gtk.Orientation.HORIZONTAL}
              hexpand
              drawValue={false}
              css="margin: 4px 0; min-height: 32px;"
              cssClasses={[
                "volume-slider",
                isMuted
                  ? "volume-slider-muted"
                  : `volume-slider-${accentColor}`,
              ]}
              $={(self) => {
                sliderRef = self;
                self.set_range(0, 100);
                self.set_increments(1, 5);
                self.set_value(Math.round(node.volume * 100));

                const gesture = new Gtk.GestureClick();
                gesture.connect("pressed", () => {
                  isDragging = true;
                });
                gesture.connect("released", () => {
                  isDragging = false;
                });
                self.add_controller(gesture);

                self.connect("value-changed", () => {
                  handleVolumeSet(self.get_value());
                });
              }}
            />

            {/* Preset Buttons - avoid nested With by using volumeBinding transform */}
            <box spacing={6} homogeneous>
              {[0, 25, 50, 75, 100].map((v) => (
                <button
                  css={volumeBinding((vol) =>
                    Math.round(vol * 100) === v
                      ? STYLES.presetButtonActive
                      : STYLES.presetButton,
                  )}
                  onClicked={() => handleVolumeSet(v)}
                >
                  <label
                    label={v === 0 ? "󰝟" : `${v}%`}
                    css={volumeBinding((vol) => {
                      const isActive = Math.round(vol * 100) === v;
                      if (isActive) {
                        return v === 0
                          ? STYLES.presetLabelActiveRed
                          : STYLES.presetLabelActive;
                      }
                      return STYLES.presetLabel;
                    })}
                  />
                </button>
              ))}
            </box>
          </box>
        )}
      </With>
    </box>
  );
}

/* ─────────────────────────────────────────────
   STREAM CONTROL
───────────────────────────────────────────── */

function StreamControl({ stream }: { stream: AstalWp.Stream }) {
  const volumeBinding = createBinding(stream, "volume");
  const mutedBinding = createBinding(stream, "mute");

  let isDragging = false;
  let sliderRef: Gtk.Scale | null = null;

  const name = stream.description || stream.name || "Unknown";

  const volumeHandler = stream.connect("notify::volume", () => {
    if (!isDragging && sliderRef) {
      const newVal = Math.round(stream.volume * 100);
      if (Math.abs(sliderRef.get_value() - newVal) > 0.5) {
        sliderRef.set_value(newVal);
      }
    }
  });

  onCleanup(() => {
    stream.disconnect(volumeHandler);
  });

  return (
    <With value={mutedBinding}>
      {(isMuted) => (
        <box
          spacing={10}
          css={isMuted ? STYLES.streamBoxMuted : STYLES.streamBox}
        >
          <button
            css={
              isMuted ? STYLES.streamMuteButtonMuted : STYLES.streamMuteButton
            }
            onClicked={() => {
              stream.mute = !stream.mute;
            }}
            tooltipText={isMuted ? "Unmute" : "Mute"}
          >
            <label
              label={isMuted ? "󰖁" : "󰎆"}
              css={isMuted ? STYLES.streamIconRed : STYLES.streamIconPurple}
            />
          </button>

          <label
            label={name}
            css="font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.92); min-width: 70px;"
            ellipsize={3}
            maxWidthChars={10}
            halign={Gtk.Align.START}
          />

          <Gtk.Scale
            orientation={Gtk.Orientation.HORIZONTAL}
            hexpand
            drawValue={false}
            cssClasses={[
              "stream-slider",
              isMuted ? "volume-slider-muted" : "volume-slider-purple",
            ]}
            $={(self) => {
              sliderRef = self;
              self.set_range(0, 100);
              self.set_increments(1, 5);
              self.set_value(Math.round(stream.volume * 100));

              const gesture = new Gtk.GestureClick();
              gesture.connect("pressed", () => {
                isDragging = true;
              });
              gesture.connect("released", () => {
                isDragging = false;
              });
              self.add_controller(gesture);

              self.connect("value-changed", () => {
                stream.volume = self.get_value() / 100;
              });
            }}
          />

          <label
            label={volumeBinding((v) => `${Math.round(v * 100)}%`)}
            css={
              isMuted ? STYLES.streamVolumeLabelMuted : STYLES.streamVolumeLabel
            }
          />
        </box>
      )}
    </With>
  );
}

/* ─────────────────────────────────────────────
   VOLUME POPUP
───────────────────────────────────────────── */

const [popupVisible, setPopupVisible] = createState(false);

function VolumePopup() {
  const [speaker, setSpeaker] = createState<AstalWp.Endpoint | null>(
    audio?.default_speaker ?? null,
  );
  const [microphone, setMicrophone] = createState<AstalWp.Endpoint | null>(
    audio?.default_microphone ?? null,
  );
  const [streams, setStreams] = createState<AstalWp.Stream[]>(
    audio?.streams ?? [],
  );

  if (audio) {
    const speakerHandler = audio.connect("notify::default-speaker", () => {
      setSpeaker(audio.default_speaker);
    });

    const micHandler = audio.connect("notify::default-microphone", () => {
      setMicrophone(audio.default_microphone);
    });

    const updateStreams = () => {
      setStreams([...(audio.streams ?? [])]);
    };

    const streamAddedHandler = audio.connect("stream-added", updateStreams);
    const streamRemovedHandler = audio.connect("stream-removed", updateStreams);

    onCleanup(() => {
      audio.disconnect(speakerHandler);
      audio.disconnect(micHandler);
      audio.disconnect(streamAddedHandler);
      audio.disconnect(streamRemovedHandler);
    });
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={14} css={STYLES.popup}>
      {/* Header */}
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={14}>
        <box
          css={`
            background: linear-gradient(
              135deg,
              rgba(122, 162, 247, 0.25),
              rgba(122, 162, 247, 0.08)
            );
            border: 1px solid rgba(122, 162, 247, 0.25);
            border-radius: 14px;
            padding: 12px;
          `}
        >
          <label label="󰕾" css="font-size: 28px; color: #7aa2f7;" />
        </box>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          hexpand
          valign={Gtk.Align.CENTER}
        >
          <label
            label="Audio Controls"
            halign={Gtk.Align.START}
            css="font-size: 16px; font-weight: 700; color: rgba(255, 255, 255, 0.92);"
          />
          <label
            label="PipeWire + WirePlumber"
            halign={Gtk.Align.START}
            css="font-size: 10px; color: #7aa2f7;"
          />
        </box>
        <button
          css={`
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.08),
              rgba(255, 255, 255, 0.03)
            );
            border: 1px solid rgba(255, 255, 255, 0.13);
            border-radius: 10px;
            padding: 8px 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.19);
          `}
          onClicked={() => setPopupVisible(false)}
        >
          <label
            label="󰅖"
            css="font-size: 16px; color: rgba(255, 255, 255, 0.5);"
          />
        </button>
      </box>

      {/* Output */}
      <With value={speaker}>
        {(spk) =>
          spk ? (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
              <label
                label="󰓃  OUTPUT"
                halign={Gtk.Align.START}
                css="font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.38); letter-spacing: 1.5px;"
              />
              <VolumeControl
                node={spk}
                label={spk.description || spk.name || "Speaker"}
                icon="󰕾"
                iconMuted="󰖁"
                accentColor="blue"
              />
            </box>
          ) : null
        }
      </With>

      {/* Input */}
      <With value={microphone}>
        {(mic) =>
          mic ? (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
              <label
                label="󰍬  INPUT"
                halign={Gtk.Align.START}
                css="font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.38); letter-spacing: 1.5px;"
              />
              <VolumeControl
                node={mic}
                label={mic.description || mic.name || "Microphone"}
                icon="󰍬"
                iconMuted="󰍭"
                accentColor="green"
              />
            </box>
          ) : null
        }
      </With>

      {/* Streams */}
      <With value={streams}>
        {(streamList) =>
          streamList.length > 0 ? (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
              <label
                label="󰎈  APPLICATIONS"
                halign={Gtk.Align.START}
                css="font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.38); letter-spacing: 1.5px;"
              />
              {streamList.map((stream) => (
                <StreamControl stream={stream} />
              ))}
            </box>
          ) : null
        }
      </With>

      {/* Open Mixer */}
      <button
        css={`
          background: linear-gradient(
            to bottom,
            rgba(122, 162, 247, 0.15),
            rgba(122, 162, 247, 0.07)
          );
          border: 1px solid rgba(122, 162, 247, 0.25);
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 3px 10px rgba(122, 162, 247, 0.13);
        `}
        onClicked={() => {
          try {
            Gio.Subprocess.new(["pwvucontrol"], Gio.SubprocessFlags.NONE);
          } catch (e) {
            console.error("Failed to open pwvucontrol:", e);
          }
        }}
      >
        <box spacing={10} halign={Gtk.Align.CENTER}>
          <label label="󰒓" css="font-size: 18px; color: #7aa2f7;" />
          <label
            label="Open Full Mixer"
            css="font-size: 13px; font-weight: 600; color: #7aa2f7;"
          />
        </box>
      </button>
    </box>
  );
}

/* ─────────────────────────────────────────────
   MAIN VOLUME WIDGET (BAR)
───────────────────────────────────────────── */

export function Volume() {
  if (!audio || !audio.default_speaker) {
    return (
      <button css={STYLES.barButton}>
        <label label="󰖁" css={STYLES.barIconMuted} />
      </button>
    );
  }

  const speaker = audio.default_speaker;
  const volumeBinding = createBinding(speaker, "volume");
  const mutedBinding = createBinding(speaker, "mute");

  // Create scroll controller once
  function createScrollController() {
    const scrollController = new Gtk.EventControllerScroll();
    scrollController.set_flags(Gtk.EventControllerScrollFlags.VERTICAL);
    scrollController.connect("scroll", (_, _dx, dy) => {
      const spk = audio?.default_speaker;
      if (spk) {
        const newVol = Math.max(0, Math.min(1.5, spk.volume - dy * 0.05));
        spk.volume = newVol;
      }
      return true;
    });
    return scrollController;
  }

  function getVolumeIcon(vol: number, muted: boolean): string {
    if (muted) return "󰖁";
    if (vol > 66) return "󰕾";
    if (vol > 33) return "󰖀";
    if (vol > 0) return "󰕿";
    return "󰝟";
  }

  return (
    <With value={mutedBinding}>
      {(isMuted) => (
        <button
          css={STYLES.barButton}
          onClicked={() => setPopupVisible(!popupVisible())}
          tooltipText={volumeBinding(
            (v) =>
              `${speaker.description || speaker.name || "Volume"}: ${Math.round(v * 100)}%${isMuted ? " (Muted)" : ""}`,
          )}
          $={(self) => self.add_controller(createScrollController())}
        >
          <box spacing={4}>
            <label
              label={volumeBinding((v) =>
                getVolumeIcon(Math.round(v * 100), isMuted),
              )}
              css={isMuted ? STYLES.barIconMuted : STYLES.barIcon}
            />
            <label
              label={volumeBinding((v) => `${Math.round(v * 100)}%`)}
              css={isMuted ? STYLES.barValueMuted : STYLES.barValue}
            />
          </box>
        </button>
      )}
    </With>
  );
}

/* ─────────────────────────────────────────────
   VOLUME POPUP WINDOW
───────────────────────────────────────────── */

export function VolumePopupWindow({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <window
      $={(self) => {
        createEffect(() => {
          self.visible = popupVisible();
        });
      }}
      visible={false}
      name="volume-popup"
      gdkmonitor={gdkmonitor}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      application={app}
      css="background: transparent;"
    >
      <box
        halign={Gtk.Align.END}
        valign={Gtk.Align.START}
        css="margin-top: 52px; margin-right: 12px;"
      >
        <VolumePopup />
      </box>
    </window>
  );
}

export {
  popupVisible as volumePopupVisible,
  setPopupVisible as setVolumePopupVisible,
};
