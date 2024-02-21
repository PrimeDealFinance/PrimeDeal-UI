import React, { useEffect } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useWalletStore } from "../service/store";

const TestComponent = () => {
  const { handleIsConnected, isConnect } = useWalletStore();

  useEffect(() => {
    handleIsConnected();
  }, [handleIsConnected]);

  return <div>{isConnect ? "Connected" : "Not Connected"}</div>;
};

describe("handleIsConnected", () => {
  beforeEach(() => {
    global.console.log = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display "Not Connected" and log message when MetaMask is not installed', async () => {
    delete global.window.ethereum;
    render(<TestComponent />);

    expect(screen.queryByText("Not Connected")).toBeTruthy();
    expect(console.log).toHaveBeenCalledWith(
      "MetaMask not installed; using read-only defaults"
    );
  });
});
