const ERC20abi = [
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];

export default ERC20abi;