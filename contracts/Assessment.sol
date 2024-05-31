// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BurgerMcdo {
    address owner;
    mapping(address => uint256) balances;

    event Deposit(address indexed account, uint256 amount);
    event Withdrawal(address indexed account, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this operation");
        _;
    }

    function deposit() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }

    function withdrawAll() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function randomizeSandwich() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Sandwich prices
        uint256[] memory sandwichPrices = new uint256[](5);
        sandwichPrices[0] = 100; // Double Cheese Burger
        sandwichPrices[1] = 80; // Burger Mcdo
        sandwichPrices[2] = 90; // Crispy Chicken Sandwich
        sandwichPrices[3] = 70; // Quarter Pounder
        sandwichPrices[4] = 85; // Cheese Burger

        // Random index
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 5;
        uint256 selectedSandwichPrice = sandwichPrices[randomIndex];

        // Deduct the price of the sandwich from the sender's balance
        require(balances[msg.sender] >= selectedSandwichPrice, "Insufficient balance to buy sandwich");
        balances[msg.sender] -= selectedSandwichPrice;

        emit Withdrawal(msg.sender, selectedSandwichPrice);
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function withdrawContractBalance() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No balance to withdraw");
        payable(owner).transfer(contractBalance);
    }

    function disconnect() external onlyOwner {
        selfdestruct(payable(owner));
    }
}
