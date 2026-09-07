// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CrocodileSVG } from "./CrocodileSVG";

describe("CrocodileSVG", () => {
  it("renders 12 lower teeth", () => {
    render(
      <CrocodileSVG
        pressedTeeth={[]}
        isMyTurn={true}
        phase="playing"
        snapped={false}
        paused={false}
        onPressTooth={() => {}}
      />
    );
    expect(document.querySelectorAll("svg .tooth")).toHaveLength(12);
  });

  it("marks a pressed tooth with the pressed class and no interactive class", () => {
    render(
      <CrocodileSVG
        pressedTeeth={[3]}
        isMyTurn={true}
        phase="playing"
        snapped={false}
        paused={false}
        onPressTooth={() => {}}
      />
    );
    const teeth = document.querySelectorAll("svg .tooth");
    expect(teeth[3].classList.contains("pressed")).toBe(true);
    expect(teeth[3].classList.contains("interactive")).toBe(false);
  });

  it("calls onPressTooth with the tooth index when an interactive tooth is clicked", async () => {
    const onPressTooth = vi.fn();
    render(
      <CrocodileSVG
        pressedTeeth={[]}
        isMyTurn={true}
        phase="playing"
        snapped={false}
        paused={false}
        onPressTooth={onPressTooth}
      />
    );
    const teeth = document.querySelectorAll("svg .tooth");
    (teeth[5] as unknown as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onPressTooth).toHaveBeenCalledWith(5);
  });

  it("does not call onPressTooth when it isn't the player's turn", () => {
    const onPressTooth = vi.fn();
    render(
      <CrocodileSVG
        pressedTeeth={[]}
        isMyTurn={false}
        phase="playing"
        snapped={false}
        paused={false}
        onPressTooth={onPressTooth}
      />
    );
    const teeth = document.querySelectorAll("svg .tooth");
    (teeth[0] as unknown as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onPressTooth).not.toHaveBeenCalled();
  });
});
