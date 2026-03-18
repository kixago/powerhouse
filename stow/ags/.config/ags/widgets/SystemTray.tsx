import { Gtk } from "ags/gtk4";
import { createState, onCleanup, With } from "ags";
import Tray from "gi://AstalTray";

const tray = Tray.get_default();

function TrayItem({ item }: { item: Tray.TrayItem }) {
  let menuButton: Gtk.MenuButton | null = null;

  onCleanup(() => {
    if (menuButton) {
      const popover = menuButton.get_popover();
      if (popover) {
        popover.popdown();
      }
    }
    menuButton = null;
  });

  return (
    <Gtk.MenuButton
      $={(self) => {
        menuButton = self;

        const actionGroup = item.get_action_group();
        if (actionGroup) {
          self.insert_action_group("dbusmenu", actionGroup);
        }

        const menuModel = item.get_menu_model();
        if (menuModel) {
          const popover = Gtk.PopoverMenu.new_from_model(menuModel);
          popover.set_has_arrow(false);
          self.set_popover(popover);
        }
      }}
      class="tray-item"
      tooltipMarkup={item.tooltipMarkup || item.title || ""}
    >
      <image gicon={item.gicon} pixelSize={16} />
    </Gtk.MenuButton>
  );
}

export function SystemTray() {
  const [items, setItems] = createState<Tray.TrayItem[]>(tray.get_items());

  const onAdded = tray.connect("item-added", () => {
    setItems([...tray.get_items()]);
  });

  const onRemoved = tray.connect("item-removed", () => {
    setItems([...tray.get_items()]);
  });

  onCleanup(() => {
    tray.disconnect(onAdded);
    tray.disconnect(onRemoved);
  });

  return (
    <box class="system-tray">
      <With value={items}>
        {(list) => (
          <box spacing={2}>
            {list
              .filter(
                (item, index, arr) =>
                  arr.findIndex((i) => i.itemId === item.itemId) === index,
              )
              .map((item) => (
                <TrayItem item={item} />
              ))}
          </box>
        )}
      </With>
    </box>
  );
}
