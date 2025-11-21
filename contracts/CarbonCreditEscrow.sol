// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonCreditEscrow
 * @dev Trustless escrow for carbon credit NFT marketplace on Hedera
 */
contract CarbonCreditEscrow is ReentrancyGuard, Pausable, Ownable {
    // Listing types
    enum ListingType { FIXED_PRICE, AUCTION, NEGOTIABLE }
    enum ListingStatus { ACTIVE, SOLD, CANCELLED, EXPIRED }
    
    // Marketplace fee (2.5% = 250 basis points)
    uint256 public constant MARKETPLACE_FEE_BPS = 250;
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    // Minimum listing duration (1 hour)
    uint256 public constant MIN_LISTING_DURATION = 1 hours;
    
    // Maximum listing duration (90 days)
    uint256 public constant MAX_LISTING_DURATION = 90 days;
    
    // Listing struct
    struct Listing {
        uint256 listingId;
        address seller;
        address tokenAddress;
        uint256 serialNumber;
        uint256 price;
        ListingType listingType;
        ListingStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        bool exists;
    }
    
    // Offer struct
    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address buyer;
        uint256 offerPrice;
        uint256 createdAt;
        uint256 expiresAt;
        bool accepted;
        bool cancelled;
    }
    
    // Auction struct
    struct Auction {
        uint256 auctionId;
        uint256 listingId;
        uint256 startPrice;
        uint256 reservePrice;
        uint256 currentBid;
        address currentBidder;
        uint256 endsAt;
        bool finalized;
    }
    
    // Bid struct
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }
    
    // State variables
    uint256 private nextListingId = 1;
    uint256 private nextOfferId = 1;
    uint256 private nextAuctionId = 1;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid[]) public auctionBids;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address tokenAddress,
        uint256 serialNumber,
        uint256 price,
        ListingType listingType
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event ListingExpired(uint256 indexed listingId);
    
    event CreditPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 marketplaceFee
    );
    
    event OfferCreated(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 offerPrice
    );
    
    event OfferAccepted(uint256 indexed offerId, uint256 indexed listingId);
    event OfferCancelled(uint256 indexed offerId);
    
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed listingId,
        uint256 startPrice,
        uint256 reservePrice
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionFinalized(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );
    
    event FundsWithdrawn(address indexed user, uint256 amount);
    
    // Modifiers
    modifier listingExists(uint256 _listingId) {
        require(listings[_listingId].exists, "Listing does not exist");
        _;
    }
    
    modifier onlySeller(uint256 _listingId) {
        require(listings[_listingId].seller == msg.sender, "Not the seller");
        _;
    }
    
    modifier listingActive(uint256 _listingId) {
        require(listings[_listingId].status == ListingStatus.ACTIVE, "Listing not active");
        require(block.timestamp < listings[_listingId].expiresAt, "Listing expired");
        _;
    }
    
    /**
     * @dev Create a new listing
     */
    function createListing(
        address _tokenAddress,
        uint256 _serialNumber,
        uint256 _price,
        ListingType _listingType,
        uint256 _duration
    ) external whenNotPaused returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(_duration >= MIN_LISTING_DURATION, "Duration too short");
        require(_duration <= MAX_LISTING_DURATION, "Duration too long");
        
        uint256 listingId = nextListingId++;
        uint256 expiresAt = block.timestamp + _duration;
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            tokenAddress: _tokenAddress,
            serialNumber: _serialNumber,
            price: _price,
            listingType: _listingType,
            status: ListingStatus.ACTIVE,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            exists: true
        });
        
        emit ListingCreated(
            listingId,
            msg.sender,
            _tokenAddress,
            _serialNumber,
            _price,
            _listingType
        );
        
        return listingId;
    }
    
    /**
     * @dev Purchase a credit at fixed price
     */
    function purchaseCredit(uint256 _listingId)
        external
        payable
        nonReentrant
        whenNotPaused
        listingExists(_listingId)
        listingActive(_listingId)
    {
        Listing storage listing = listings[_listingId];
        require(listing.listingType == ListingType.FIXED_PRICE, "Not a fixed price listing");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Cannot buy own listing");
        
        // Calculate marketplace fee
        uint256 marketplaceFee = (listing.price * MARKETPLACE_FEE_BPS) / BPS_DENOMINATOR;
        uint256 sellerProceeds = listing.price - marketplaceFee;
        
        // Update listing status
        listing.status = ListingStatus.SOLD;
        
        // Add funds to pending withdrawals
        pendingWithdrawals[listing.seller] += sellerProceeds;
        pendingWithdrawals[owner()] += marketplaceFee;
        
        emit CreditPurchased(_listingId, msg.sender, listing.price, marketplaceFee);
    }
    
    /**
     * @dev Make an offer on a negotiable listing
     */
    function makeOffer(uint256 _listingId, uint256 _expiresIn)
        external
        payable
        whenNotPaused
        listingExists(_listingId)
        listingActive(_listingId)
        returns (uint256)
    {
        Listing storage listing = listings[_listingId];
        require(listing.listingType == ListingType.NEGOTIABLE, "Not a negotiable listing");
        require(msg.value > 0, "Offer must be greater than 0");
        require(msg.sender != listing.seller, "Cannot offer on own listing");
        
        uint256 offerId = nextOfferId++;
        uint256 expiresAt = block.timestamp + _expiresIn;
        
        offers[offerId] = Offer({
            offerId: offerId,
            listingId: _listingId,
            buyer: msg.sender,
            offerPrice: msg.value,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            accepted: false,
            cancelled: false
        });
        
        emit OfferCreated(offerId, _listingId, msg.sender, msg.value);
        
        return offerId;
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 _offerId)
        external
        nonReentrant
        whenNotPaused
    {
        Offer storage offer = offers[_offerId];
        require(!offer.accepted, "Offer already accepted");
        require(!offer.cancelled, "Offer cancelled");
        require(block.timestamp < offer.expiresAt, "Offer expired");
        
        Listing storage listing = listings[offer.listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");
        
        // Calculate marketplace fee
        uint256 marketplaceFee = (offer.offerPrice * MARKETPLACE_FEE_BPS) / BPS_DENOMINATOR;
        uint256 sellerProceeds = offer.offerPrice - marketplaceFee;
        
        // Update statuses
        offer.accepted = true;
        listing.status = ListingStatus.SOLD;
        
        // Add funds to pending withdrawals
        pendingWithdrawals[listing.seller] += sellerProceeds;
        pendingWithdrawals[owner()] += marketplaceFee;
        
        emit OfferAccepted(_offerId, offer.listingId);
    }
    
    /**
     * @dev Cancel an offer and refund
     */
    function cancelOffer(uint256 _offerId) external nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.buyer == msg.sender, "Not the offer creator");
        require(!offer.accepted, "Offer already accepted");
        require(!offer.cancelled, "Offer already cancelled");
        
        offer.cancelled = true;
        
        // Refund the offer amount
        pendingWithdrawals[msg.sender] += offer.offerPrice;
        
        emit OfferCancelled(_offerId);
    }
    
    /**
     * @dev Create an auction
     */
    function createAuction(
        uint256 _listingId,
        uint256 _startPrice,
        uint256 _reservePrice,
        uint256 _duration
    )
        external
        listingExists(_listingId)
        onlySeller(_listingId)
        returns (uint256)
    {
        Listing storage listing = listings[_listingId];
        require(listing.listingType == ListingType.AUCTION, "Not an auction listing");
        require(_startPrice > 0, "Start price must be greater than 0");
        require(_reservePrice >= _startPrice, "Reserve price too low");
        
        uint256 auctionId = nextAuctionId++;
        uint256 endsAt = block.timestamp + _duration;
        
        auctions[auctionId] = Auction({
            auctionId: auctionId,
            listingId: _listingId,
            startPrice: _startPrice,
            reservePrice: _reservePrice,
            currentBid: 0,
            currentBidder: address(0),
            endsAt: endsAt,
            finalized: false
        });
        
        emit AuctionCreated(auctionId, _listingId, _startPrice, _reservePrice);
        
        return auctionId;
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 _auctionId)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp < auction.endsAt, "Auction ended");
        require(!auction.finalized, "Auction finalized");
        require(msg.value > auction.currentBid, "Bid too low");
        require(msg.value >= auction.startPrice, "Bid below start price");
        
        Listing storage listing = listings[auction.listingId];
        require(msg.sender != listing.seller, "Seller cannot bid");
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            pendingWithdrawals[auction.currentBidder] += auction.currentBid;
        }
        
        // Update auction
        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;
        
        // Record bid
        auctionBids[_auctionId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        // Auto-extend if bid in last 5 minutes
        if (auction.endsAt - block.timestamp < 5 minutes) {
            auction.endsAt += 5 minutes;
        }
        
        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }
    
    /**
     * @dev Finalize an auction
     */
    function finalizeAuction(uint256 _auctionId)
        external
        nonReentrant
        whenNotPaused
    {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.endsAt, "Auction not ended");
        require(!auction.finalized, "Already finalized");
        
        auction.finalized = true;
        
        Listing storage listing = listings[auction.listingId];
        
        // Check if reserve price met
        if (auction.currentBid >= auction.reservePrice && auction.currentBidder != address(0)) {
            // Calculate marketplace fee
            uint256 marketplaceFee = (auction.currentBid * MARKETPLACE_FEE_BPS) / BPS_DENOMINATOR;
            uint256 sellerProceeds = auction.currentBid - marketplaceFee;
            
            // Update listing status
            listing.status = ListingStatus.SOLD;
            
            // Add funds to pending withdrawals
            pendingWithdrawals[listing.seller] += sellerProceeds;
            pendingWithdrawals[owner()] += marketplaceFee;
            
            emit AuctionFinalized(_auctionId, auction.currentBidder, auction.currentBid);
        } else {
            // Reserve not met, refund highest bidder
            if (auction.currentBidder != address(0)) {
                pendingWithdrawals[auction.currentBidder] += auction.currentBid;
            }
            listing.status = ListingStatus.CANCELLED;
        }
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 _listingId)
        external
        listingExists(_listingId)
        onlySeller(_listingId)
    {
        Listing storage listing = listings[_listingId];
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");
        
        listing.status = ListingStatus.CANCELLED;
        
        emit ListingCancelled(_listingId);
    }
    
    /**
     * @dev Withdraw pending funds
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 _listingId)
        external
        view
        returns (Listing memory)
    {
        return listings[_listingId];
    }
    
    /**
     * @dev Get auction details
     */
    function getAuction(uint256 _auctionId)
        external
        view
        returns (Auction memory)
    {
        return auctions[_auctionId];
    }
    
    /**
     * @dev Get auction bids
     */
    function getAuctionBids(uint256 _auctionId)
        external
        view
        returns (Bid[] memory)
    {
        return auctionBids[_auctionId];
    }
}
