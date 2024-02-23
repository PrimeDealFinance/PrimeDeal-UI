import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BuyCard from "@/components/BuyCard";
import React from "react";

vi.mock("@/service/store", () => ({
  useWalletStore: vi.fn(() => ({
    isConnect: true,
    positionManagerContractAddress:
      "0x5ce832046e25fBAc5De4519f4d3b8052EDA5Fa86",
    USDTContractAddress: "0x9EC3c43006145f5701d4FD527e826131778cA122",
    ETHContractAddress: "0xE26D5DBB28bB4A7107aeCD84d5976A06f21d8Da9",
    positionManagerContractAbi: JSON.parse(
      process.env.NEXT_PUBLIC_POSITION_MANAGER_ABI || "[]"
    ),
    reinitializeContracts: vi.fn(),
    USDTContractAbi: [
      "function balanceOf(address _owner) public view returns (uint256 balance)",
      "function approve(address _spender, uint256 _value) public returns (bool success)",
      "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
    ],
    ETHContractAbi: [
      "function balanceOf(address _owner) public view returns (uint256 balance)",
      "function approve(address _spender, uint256 _value) public returns (bool success)",
      "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
    ],
    contractSigner: {
      openBuyPosition: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({}),
      }),
    },
  })),
}));

describe("BuyCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should open the modal on button click when input value is set and conditions are met", async () => {
    render(<BuyCard />);

    const amountInput = screen.getByPlaceholderText("Amount");
    fireEvent.change(amountInput, { target: { value: "3" } });

    const openButton = screen.getByRole("button", { name: /create order/i });
    fireEvent.click(openButton);

    const confirmationModal = await screen.findByText("Confirmation");
    expect(confirmationModal).toBeTruthy();
  });
});
