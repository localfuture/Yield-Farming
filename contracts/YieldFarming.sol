// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YieldFarming is ERC20 {
    address public owner;
    uint whaleThreshold = 10000 wei;
    address[] whales;
    mapping(address => bool) isWhale;

    mapping(address => uint) balance;

    uint pId;
    struct PoolDeposit {
        uint amount;
        uint time;
    }

    struct Pool {
        uint userCount;
        uint maxAmount;
        uint yeildPercent;
        uint minDeposit;
        uint rewardTime;
        uint totalDeposit;
        mapping(address => PoolDeposit) ledger;
        mapping(uint => address) user;
    }
    mapping(uint => Pool) pools;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
    }

    // @dev allows the owner of the contract to add a new liquidity pool.The pool ID starts from 0
    // @params maxAmount: The maximum amount in Wei that the pool can hold.
    // @params yieldPercent: The percentage of rewards that will be given out per unit of time.
    // @params minDeposit: The minimum amount of Wei that must be deposited into the pool.
    // @params rewardTime: The time interval in seconds at which rewards are provided.
    //  After every rewardTime, the user will receive their share of rewards.
    function addPool(uint maxAmount, uint yieldPercent, uint minDeposit, uint rewardTime) public onlyOwner {
        require(minDeposit < maxAmount, "min should be less than max");

        // Mint 100 tokens to msg.sender
        // Similar to how
        // 1 dollar = 100 cents
        // 1 token = 1 * (10 ** decimals)
        _mint(msg.sender, maxAmount * 10 ** uint256(2));

        pools[pId].maxAmount = maxAmount;
        pools[pId].yeildPercent = yieldPercent;
        pools[pId].minDeposit = minDeposit;
        pools[pId].rewardTime = rewardTime;
        pools[pId].totalDeposit = 0;

        pId++;
    }

    // @dev Allows anyone to deposit Wei into a specific liquidity pool.
    //      The function checks if the yield farming is active,
    //      the amount sent is greater than the minimum deposit amount,
    //      and the pool exists. No user is allowed to deposit twice in the same pool.
    function depositWei(uint poolId) public payable {
        require(pools[poolId].minDeposit < msg.value, "Insufficient Deposit");
        require(pools[poolId].maxAmount >= msg.value + pools[poolId].totalDeposit, "max limit exceeded");

        pools[poolId].totalDeposit += msg.value;

        balance[msg.sender] += msg.value;

        pools[poolId].ledger[msg.sender].amount = msg.value;
        pools[poolId].ledger[msg.sender].time = block.timestamp;

        uint userCount = pools[poolId].userCount;
        pools[poolId].user[userCount] = msg.sender;
        pools[poolId].userCount += 1;

        if (balance[msg.sender] > whaleThreshold) {
            isWhale[msg.sender] = true;
            whales.push(msg.sender);
        }
    }

    // @dev Enables a user to withdraw a specified amount of Wei they have deposited.
    //      If the user withdraws all of their deposited Wei,
    //      their unclaimed rewards are reset to zero.
    function withdrawWei(uint poolId, uint amount) public { 
       require(pools[poolId].ledger[msg.sender].amount > 0, "insufficient funds");

        pools[poolId].ledger[msg.sender].amount -= amount;
        pools[poolId].totalDeposit -= amount;
        balance[msg.sender] -= amount;

        if (pools[poolId].ledger[msg.sender].amount == 0) {
             pools[poolId].ledger[msg.sender].time = block.timestamp;
        }

        payable(msg.sender).transfer(amount);
    }

    // @dev Allows a user to claim their rewards.
    //      The rewards are proportional to the amount of time and the amount of Wei that the user has deposited.
    //      For example, if the yield percent is 2%, reward time is 10 seconds and a user who deposited 100 Wei
    //      and waited for 30 seconds would receive 6 tokens. This function can only be called if the claimable
    //      reward is greater than 0.
    function claimRewards(uint poolId) public {
        uint rewards = checkClaimableRewards(poolId);
        require(rewards > 0, "no rewards");

        if (isWhale[msg.sender]) {
            rewards = (rewards * 120) / 100;
        }

        pools[poolId].ledger[msg.sender].time = block.timestamp;
        _update(owner, msg.sender, rewards);
    }

    // @dev Returns the details of the specified pool including the
    // maximum amount, yield percentage, minimum deposit, and reward providing time.
    function checkPoolDetails(uint poolId) public view returns (uint, uint, uint, uint) {
        return (
            pools[poolId].maxAmount,
            pools[poolId].yeildPercent,
            pools[poolId].minDeposit,
            pools[poolId].rewardTime
        );
    }

    // @dev Returns the total amount of Wei that the user has deposited in all pools and the total claimable rewards
    function checkUserDeposits(address user) public view returns (uint, uint) {
        uint rewards = 0;

        for(uint i = 0; i < pId; i++) {
            uint timeElapsed = block.timestamp - pools[i].ledger[user].time;

            uint rewardTime = timeElapsed / pools[i].rewardTime;

            uint rewardPercentage = pools[i].yeildPercent * rewardTime;

            uint reward = (pools[i].ledger[user].amount * rewardPercentage) / 100;

            rewards += reward;
        }

        return (balance[user], rewards);
    }

    // @dev  Returns two arrays - the list of addresses that have deposited in the specified pool, and the amount they have deposited.
    function checkUserDepositInPool(uint poolId) public view returns (address[] memory, uint[] memory) {
        uint userCount = pools[poolId].userCount;
        address[] memory users = new address[](userCount);
        uint[] memory deposits = new uint[](userCount);

        for(uint i = 0; i < userCount; i++) {
            address user = pools[poolId].user[i];
            users[i] = user;

            uint deposit = pools[poolId].ledger[user].amount;
            deposits[i] = deposit;
        }

        return (users, deposits);
    }

    // @dev Returns the number of tokens that a depositor will receive after the reward time has passed for the specified pool.
    //      For example, if the yield rate is 2% ,reward time is 10 seconds, a user who deposited 100 Wei and waited for 30 seconds
    //      would receive 6 tokens.
    function checkClaimableRewards(uint poolId) public view returns (uint) {
        uint timeElapsed = block.timestamp - pools[poolId].ledger[msg.sender].time;

        uint rewardTime = timeElapsed / pools[poolId].rewardTime;

        uint rewardPercentage = pools[poolId].yeildPercent * rewardTime;

        uint reward = (pools[poolId].ledger[msg.sender].amount * rewardPercentage) / 100;

        return reward;
    }

    // @dev Returns the remaining capacity of the specified pool in Wei.
    function checkRemainingCapacity(uint poolId) public view returns (uint) {
        return pools[poolId].maxAmount - pools[poolId].totalDeposit;
    }

    // @dev Return an array of addresses that are considered "whale" wallets.
    function checkWhaleWallets() public view returns (address[] memory) {
        return whales;
    }
}
