import React from "react";
import { useWalletStore } from "../service/store";
import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import TestWalletComponent from "./test-wallet-component";

describe("useWalletStore", () => {
  beforeEach(() => {
    useWalletStore.setState(
      {
        isConnect: true,
        account: "",
        provider: null,
        signer: null,
        network: null,
      },
      false
    );
  });

  it("should reset wallet state when disconnectWallet is called", async () => {
    useWalletStore.setState({
      isConnect: true,
      account: "0x123",
    });

    render(<TestWalletComponent />);

    expect(screen.getByTestId("isConnect").textContent).toBe("true");
    expect(screen.getByTestId("account").textContent).toBe("0x123");

    fireEvent.click(screen.getByText("Disconnect Wallet"));

    expect(screen.getByTestId("isConnect").textContent).toBe("false");
    expect(screen.getByTestId("account").textContent).toBe("");
  });
});
