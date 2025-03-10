// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Symposium.sol";

contract SymposiumTest is Test {
    Symposium public symposium;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public carol = makeAddr("carol");
    address public dave = makeAddr("dave");
    address public eve = makeAddr("eve");
    address public frank = makeAddr("frank");
    address public grace = makeAddr("grace");

    uint256 public constant VOTE_COST = 0.1 ether;

    function setUp() public {
        symposium = new Symposium();
        // Give each test address some ETH
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.deal(carol, 1 ether);
        vm.deal(dave, 1 ether);
        vm.deal(eve, 1 ether);
        vm.deal(frank, 1 ether);
        vm.deal(grace, 1 ether);
    }

    function test_CreateProposal() public {
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        // Just check that it doesn't revert
        symposium.proposalCount();
    }

    function test_CreateOpinion() public {
        // Create proposal first
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        // Bob creates YES opinion
        vm.prank(bob);
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");

        // Carol creates NO opinion
        vm.prank(carol);
        symposium.createOpinion{value: VOTE_COST}(1, false, "I'm allergic");
    }

    function test_VoteForOpinion() public {
        // Setup: Create proposal and opinions
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        vm.prank(bob);
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");

        vm.prank(carol);
        symposium.createOpinion{value: VOTE_COST}(1, false, "I'm allergic");

        // Dave votes for Bob's opinion
        vm.prank(dave);
        symposium.voteForOpinion{value: VOTE_COST}(1, 0);

        // Eve votes for Carol's opinion
        vm.prank(eve);
        symposium.voteForOpinion{value: VOTE_COST}(1, 1);
    }

    function test_RevertDoubleVote() public {
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        // First vote: Bob creates an opinion
        vm.prank(bob);
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");

        // Try to vote again by creating another opinion
        vm.prank(bob);
        vm.expectRevert("Already voted");
        symposium.createOpinion{value: VOTE_COST}(1, false, "Changed my mind!");

        // Carol creates an opinion
        vm.prank(carol);
        symposium.createOpinion{value: VOTE_COST}(1, false, "I'm allergic");

        // Dave votes for Bob's opinion
        vm.prank(dave);
        symposium.voteForOpinion{value: VOTE_COST}(1, 0);

        // Dave tries to vote again
        vm.prank(dave);
        vm.expectRevert("Already voted");
        symposium.voteForOpinion{value: VOTE_COST}(1, 1);
    }

    function test_RevertInvalidVoteCost() public {
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        vm.prank(bob);
        vm.expectRevert("Must send 0.1 ETH");
        symposium.createOpinion{value: 0.05 ether}(1, true, "Cats are great!");
    }

    function test_RevertExpiredProposal() public {
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        // Fast forward 2 days
        vm.warp(block.timestamp + 2 days);

        vm.prank(bob);
        vm.expectRevert("Proposal expired");
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");
    }

    function test_CompleteVotingCycleYesWins() public {
        // Create proposal
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        // Bob creates YES opinion and gets 2 votes (Dave, Eve)
        vm.prank(bob);
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");

        vm.prank(dave);
        symposium.voteForOpinion{value: VOTE_COST}(1, 0);

        vm.prank(eve);
        symposium.voteForOpinion{value: VOTE_COST}(1, 0);

        // Carol creates NO opinion and gets 1 vote (Frank)
        vm.prank(carol);
        symposium.createOpinion{value: VOTE_COST}(1, false, "I'm allergic");

        vm.prank(frank);
        symposium.voteForOpinion{value: VOTE_COST}(1, 1);

        // Fast forward past expiry
        vm.warp(block.timestamp + 1 days + 1);

        // Grace finalizes the proposal
        vm.prank(grace);
        symposium.finalizeProposal(1);

        // Bob claims (creator with 3 votes)
        vm.prank(bob);
        symposium.claimReward(1);

        // Dave claims (voter)
        vm.prank(dave);
        symposium.claimReward(1);

        // Eve claims (voter)
        vm.prank(eve);
        symposium.claimReward(1);

        // Carol tries to claim (should fail - losing side)
        vm.prank(carol);
        vm.expectRevert("No reward to claim");
        symposium.claimReward(1);
    }

    function test_CompleteVotingCycleNoWins() public {
        // Create proposal
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        // Bob creates YES opinion and gets 1 vote (Dave)
        vm.prank(bob);
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");

        vm.prank(dave);
        symposium.voteForOpinion{value: VOTE_COST}(1, 0);

        // Carol creates NO opinion and gets 2 votes (Frank, Eve)
        vm.prank(carol);
        symposium.createOpinion{value: VOTE_COST}(1, false, "I'm allergic");

        vm.prank(frank);
        symposium.voteForOpinion{value: VOTE_COST}(1, 1);

        vm.prank(eve);
        symposium.voteForOpinion{value: VOTE_COST}(1, 1);

        // Fast forward past expiry
        vm.warp(block.timestamp + 1 days + 1);

        // Grace finalizes the proposal
        vm.prank(grace);
        symposium.finalizeProposal(1);

        // Carol claims (creator with 3 votes)
        vm.prank(carol);
        symposium.claimReward(1);

        // Frank claims (voter)
        vm.prank(frank);
        symposium.claimReward(1);

        // Eve claims (voter)
        vm.prank(eve);
        symposium.claimReward(1);

        // Bob tries to claim (should fail - losing side)
        vm.prank(bob);
        vm.expectRevert("No reward to claim");
        symposium.claimReward(1);
    }

    function test_RevertDoubleClaim() public {
        // Create and finalize a proposal with YES winning
        vm.prank(alice);
        symposium.createProposal(
            "Cat Adoption",
            "Should we adopt a cat?",
            1 days
        );

        vm.prank(bob);
        symposium.createOpinion{value: VOTE_COST}(1, true, "Cats are great!");

        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(grace);
        symposium.finalizeProposal(1);

        // Bob claims his reward
        vm.prank(bob);
        symposium.claimReward(1);

        // Bob tries to claim again
        vm.prank(bob);
        vm.expectRevert("Already claimed");
        symposium.claimReward(1);
    }
}
