// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TipJar
 * @notice A shared tipping contract for Farcaster creators on Base
 * @dev Single contract handles all tips with 2% protocol fee
 * 
 * Design Philosophy:
 * - Minimal gas usage for tippers
 * - Immediate forwarding (no withdrawal pattern needed)
 * - Simple, auditable, secure
 */
contract TipJar {
    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Protocol fee in basis points (2% = 200 bps)
    uint256 public constant PROTOCOL_FEE_BPS = 200;
    
    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    /// @notice Minimum tip amount (0.0001 ETH) to prevent dust attacks
    uint256 public constant MIN_TIP_AMOUNT = 0.0001 ether;

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Protocol fee recipient
    address public immutable protocolFeeRecipient;
    
    /// @notice Total tips received by each creator (gross amount before fees)
    mapping(address => uint256) public totalTipsReceived;
    
    /// @notice Total tip count per creator
    mapping(address => uint256) public tipCount;
    
    /// @notice Global tip counter for indexing
    uint256 public globalTipCount;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Emitted when a tip is sent
    /// @param tipId Global tip ID for indexing
    /// @param sender The tipper's address
    /// @param recipient The creator's address
    /// @param amount Gross tip amount (before fee)
    /// @param fee Protocol fee taken
    /// @param timestamp Block timestamp
    event TipSent(
        uint256 indexed tipId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════
    
    error InvalidRecipient();
    error TipTooSmall();
    error TransferFailed();

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @param _protocolFeeRecipient Address to receive protocol fees
    constructor(address _protocolFeeRecipient) {
        if (_protocolFeeRecipient == address(0)) revert InvalidRecipient();
        protocolFeeRecipient = _protocolFeeRecipient;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Send a tip to a creator
    /// @param recipient The creator's address to tip
    function tip(address recipient) external payable {
        if (recipient == address(0)) revert InvalidRecipient();
        if (msg.value < MIN_TIP_AMOUNT) revert TipTooSmall();
        
        // Calculate fee (2%)
        uint256 fee = (msg.value * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = msg.value - fee;
        
        // Update state before transfers (CEI pattern)
        unchecked {
            globalTipCount++;
            totalTipsReceived[recipient] += msg.value;
            tipCount[recipient]++;
        }
        
        uint256 tipId = globalTipCount;
        
        // Transfer to creator (immediate forwarding)
        (bool creatorSuccess, ) = recipient.call{value: creatorAmount}("");
        if (!creatorSuccess) revert TransferFailed();
        
        // Transfer fee to protocol
        (bool feeSuccess, ) = protocolFeeRecipient.call{value: fee}("");
        if (!feeSuccess) revert TransferFailed();
        
        emit TipSent(
            tipId,
            msg.sender,
            recipient,
            msg.value,
            fee,
            block.timestamp
        );
    }
    
    /// @notice Convenience function to tip with a message (message stored in calldata only)
    /// @param recipient The creator's address to tip
    /// @param message A message to include (emitted but not stored)
    function tipWithMessage(address recipient, string calldata message) external payable {
        // Message is in calldata for indexers to read, but we use the same logic
        this.tip{value: msg.value}(recipient);
        emit TipMessage(globalTipCount, message);
    }
    
    /// @notice Emitted when a tip includes a message
    event TipMessage(uint256 indexed tipId, string message);

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Get creator stats
    /// @param creator The creator's address
    /// @return total Total tips received (gross)
    /// @return count Number of tips received
    function getCreatorStats(address creator) external view returns (
        uint256 total,
        uint256 count
    ) {
        return (totalTipsReceived[creator], tipCount[creator]);
    }
    
    /// @notice Calculate fee for a given tip amount
    /// @param amount The tip amount
    /// @return fee The protocol fee
    /// @return creatorAmount Amount creator receives
    function calculateFee(uint256 amount) external pure returns (
        uint256 fee,
        uint256 creatorAmount
    ) {
        fee = (amount * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        creatorAmount = amount - fee;
    }
}
