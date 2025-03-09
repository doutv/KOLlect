// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Symposium {
    struct Opinion {
        bool vote;           // true for yes, false for no
        string reasoning;    // reasoning for the vote
        address creator;     // creator of this opinion
        uint256 voteCount;  // number of votes for this opinion
    }

    struct Proposal {
        string title;           // proposal title
        string details;          // proposal details stored directly
        uint256 expireTime;     // timestamp when proposal expires
        bool isFinalized;       // whether proposal is finalized
        Opinion[] opinions;     // list of opinions
        mapping(address => bool) hasVoted;  // track if address has voted
        mapping(address => uint256) voterToOpinionIndex; // track which opinion a voter voted for
        uint256 totalYesVotes;  // track total yes votes
        uint256 totalNoVotes;   // track total no votes
        bool yesWins;           // store which side won
        uint256 totalShares;    // store total shares of winning side
        uint256 totalPot;       // store total pot to distribute
        mapping(address => bool) hasClaimed; // track who has claimed rewards
    }

    uint256 public constant VOTE_COST = 0.1 ether;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed proposalId, string title, string details, uint256 expireTime);
    event OpinionCreated(uint256 indexed proposalId, uint256 opinionIndex, address creator, bool vote, string reasoning);
    event VoteCast(uint256 indexed proposalId, uint256 opinionIndex, address voter);
    event ProposalFinalized(uint256 indexed proposalId, bool yesWins, uint256 totalShares, uint256 totalPot);
    event RewardClaimed(uint256 indexed proposalId, address indexed claimer, uint256 amount);

    function createProposal(string calldata _title, string calldata _details, uint256 _duration) external {
        require(_duration > 0, "Duration must be positive");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.title = _title;
        proposal.details = _details;
        proposal.expireTime = block.timestamp + _duration;
        proposal.isFinalized = false;
        proposal.totalYesVotes = 0;
        proposal.totalNoVotes = 0;

        emit ProposalCreated(proposalCount, _title, _details, proposal.expireTime);
    }

    function createOpinion(uint256 _proposalId, bool _vote, string calldata _reasoning) external payable {
        require(msg.value == VOTE_COST, "Must send 0.1 ETH");
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.isFinalized, "Proposal is finalized");
        require(block.timestamp < proposal.expireTime, "Proposal expired");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        Opinion memory newOpinion = Opinion({
            vote: _vote,
            reasoning: _reasoning,
            creator: msg.sender,
            voteCount: 1
        });
        uint256 opinionIndex = proposal.opinions.length;
        proposal.opinions.push(newOpinion);
        proposal.hasVoted[msg.sender] = true;
        proposal.voterToOpinionIndex[msg.sender] = opinionIndex;

        // Update vote counts
        if (_vote) {
            proposal.totalYesVotes++;
        } else {
            proposal.totalNoVotes++;
        }

        emit OpinionCreated(_proposalId, opinionIndex, msg.sender, _vote, _reasoning);
    }

    function voteForOpinion(uint256 _proposalId, uint256 _opinionIndex) external payable {
        require(msg.value == VOTE_COST, "Must send 0.1 ETH");
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.isFinalized, "Proposal is finalized");
        require(block.timestamp < proposal.expireTime, "Proposal expired");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(_opinionIndex < proposal.opinions.length, "Invalid opinion index");

        Opinion storage opinion = proposal.opinions[_opinionIndex];
        opinion.voteCount++;
        proposal.hasVoted[msg.sender] = true;
        proposal.voterToOpinionIndex[msg.sender] = _opinionIndex;

        // Update vote counts
        if (opinion.vote) {
            proposal.totalYesVotes++;
        } else {
            proposal.totalNoVotes++;
        }

        emit VoteCast(_proposalId, _opinionIndex, msg.sender);
    }

    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.isFinalized, "Already finalized");
        require(block.timestamp >= proposal.expireTime, "Not expired yet");

        proposal.yesWins = proposal.totalYesVotes > proposal.totalNoVotes;
        proposal.totalPot = (proposal.totalYesVotes + proposal.totalNoVotes) * VOTE_COST;
        
        // Calculate total shares for winning side
        for (uint256 i = 0; i < proposal.opinions.length; i++) {
            Opinion storage opinion = proposal.opinions[i];
            if (opinion.vote == proposal.yesWins) {
                // Creator gets shares equal to total votes for their opinion
                proposal.totalShares += opinion.voteCount;
                // Each voter gets 1 share (except creator who already got counted)
                proposal.totalShares += opinion.voteCount - 1;
            }
        }

        proposal.isFinalized = true;
        emit ProposalFinalized(_proposalId, proposal.yesWins, proposal.totalShares, proposal.totalPot);
    }

    function claimReward(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.isFinalized, "Proposal not finalized");
        require(proposal.hasVoted[msg.sender], "Never voted on this proposal");
        require(!proposal.hasClaimed[msg.sender], "Already claimed");

        uint256 opinionIndex = proposal.voterToOpinionIndex[msg.sender];
        Opinion storage opinion = proposal.opinions[opinionIndex];
        
        uint256 reward = 0;
        // Only winning side gets rewards
        if (opinion.vote == proposal.yesWins) {
            if (msg.sender == opinion.creator) {
                // Creator gets shares equal to vote count
                reward = (proposal.totalPot * opinion.voteCount) / proposal.totalShares;
            } else {
                // Regular voter gets 1 share
                reward = proposal.totalPot / proposal.totalShares;
            }
        }

        require(reward > 0, "No reward to claim");
        proposal.hasClaimed[msg.sender] = true;
        payable(msg.sender).transfer(reward);
        
        emit RewardClaimed(_proposalId, msg.sender, reward);
    }
}

