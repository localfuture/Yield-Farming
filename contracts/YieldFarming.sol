// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YieldFarming is ERC20{

    address public owner;

    uint pId;
    struct Pool {
        uint maxAmount;
        uint yeildPercent;
        uint minDeposit;
        uint rewardTime;
    }
    mapping (uint => Pool) pools;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol) {
        owner = msg.sender;
        // Mint 100 tokens to msg.sender
        // Similar to how
        // 1 dollar = 100 cents
        // 1 token = 1 * (10 ** decimals)
        _mint(msg.sender, 100 * 10 ** uint256(decimals));
    }
    
    // @dev allows the owner of the contract to add a new liquidity pool.The pool ID starts from 0
    // @params maxAmount: The maximum amount in Wei that the pool can hold.
    // @params yieldPercent: The percentage of rewards that will be given out per unit of time.
    // @params minDeposit: The minimum amount of Wei that must be deposited into the pool.
    // @params rewardTime: The time interval in seconds at which rewards are provided. 
                        //  After every rewardTime, the user will receive their share of rewards.
    function addPool(uint maxAmount, uint yieldPercent, uint minDeposit, uint rewardTime) public onlyOwner {
        require(minDeposit < maxAmount, "min should be less than max");
        pools[pId] = Pool(maxAmount, yieldPercent, minDeposit, rewardTime);
    }

    // @dev Allows anyone to deposit Wei into a specific liquidity pool. 
    //      The function checks if the yield farming is active, 
    //      the amount sent is greater than the minimum deposit amount, 
    //      and the pool exists. No user is allowed to deposit twice in the same pool.
    function depositWei(uint poolId) public payable {}

    // @dev Enables a user to withdraw a specified amount of Wei they have deposited. 
    //      If the user withdraws all of their deposited Wei, 
    //      their unclaimed rewards are reset to zero.
    function withdrawWei(uint poolId, uint amount) public {}

    // @dev Allows a user to claim their rewards. 
    //      The rewards are proportional to the amount of time and the amount of Wei that the user has deposited. 
    //      For example, if the yield percent is 2%, reward time is 10 seconds and a user who deposited 100 Wei 
    //      and waited for 30 seconds would receive 6 tokens. This function can only be called if the claimable 
    //      reward is greater than 0.
    function claimRewards(uint poolId) public {}

    // @dev Returns the details of the specified pool including the 
    // maximum amount, yield percentage, minimum deposit, and reward providing time.
    function checkPoolDetails(uint poolId) public view returns (uint, uint, uint, uint) {}

    // @dev Returns the total amount of Wei that the user has deposited in all pools and the total claimable rewards
    function checkUserDeposits(address user) public view returns (uint, uint) {}

    // @dev  Returns two arrays - the list of addresses that have deposited in the specified pool, and the amount they have deposited.
    function checkUserDepositInPool(uint poolId) public view returns (address[] memory, uint[] memory) {}

    // @dev Returns the number of tokens that a depositor will receive after the reward time has passed for the specified pool. 
    //      For example, if the yield rate is 2% ,reward time is 10 seconds, a user who deposited 100 Wei and waited for 30 seconds 
    //      would receive 6 tokens.
    function checkClaimableRewards(uint poolId) public view returns (uint) {}

    // @dev Returns the remaining capacity of the specified pool in Wei.
    function checkRemainingCapacity(uint poolId) public view returns (uint) {}

    // @dev Return an array of addresses that are considered "whale" wallets.
    function checkWhaleWallets() public view returns (address[] memory) {}

}