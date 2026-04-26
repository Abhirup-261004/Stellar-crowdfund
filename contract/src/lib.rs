#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, token, Address, Env,
    String,
};

#[contract]
pub struct CrowdfundContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub id: u32,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub goal: i128,
    pub deadline: u64,
    pub raised: i128,
    pub withdrawn: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Token,
    CampaignCount,
    Campaign(u32),
    Contribution(u32, Address),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum CrowdfundError {
    AlreadyInitialized = 1,
    TokenNotSet = 2,
    GoalMustBePositive = 3,
    DeadlineMustBeFuture = 4,
    CampaignNotFound = 5,
    AmountMustBePositive = 6,
    CampaignEnded = 7,
    CampaignStillActive = 8,
    GoalNotReached = 9,
    GoalAlreadyReached = 10,
    NotCampaignCreator = 11,
    AlreadyWithdrawn = 12,
    NothingToRefund = 13,
}

fn get_token(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&DataKey::Token)
        .unwrap_or_else(|| panic_with_error!(env, CrowdfundError::TokenNotSet))
}

fn get_campaign_or_panic(env: &Env, campaign_id: u32) -> Campaign {
    env.storage()
        .persistent()
        .get(&DataKey::Campaign(campaign_id))
        .unwrap_or_else(|| panic_with_error!(env, CrowdfundError::CampaignNotFound))
}

fn set_campaign(env: &Env, campaign: &Campaign) {
    env.storage()
        .persistent()
        .set(&DataKey::Campaign(campaign.id), campaign);
}

fn get_contribution_internal(env: &Env, campaign_id: u32, contributor: Address) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Contribution(campaign_id, contributor))
        .unwrap_or(0)
}

#[contractimpl]
impl CrowdfundContract {
    pub fn init(env: Env, token: Address) {
        if env.storage().persistent().has(&DataKey::Token) {
            panic_with_error!(&env, CrowdfundError::AlreadyInitialized);
        }

        env.storage().persistent().set(&DataKey::Token, &token);
        env.storage().persistent().set(&DataKey::CampaignCount, &0u32);
    }

    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        goal: i128,
        deadline: u64,
    ) -> u32 {
        creator.require_auth();

        if goal <= 0 {
            panic_with_error!(&env, CrowdfundError::GoalMustBePositive);
        }

        let now = env.ledger().timestamp();
        if deadline <= now {
            panic_with_error!(&env, CrowdfundError::DeadlineMustBeFuture);
        }

        let mut count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);

        let campaign_id = count;

        let campaign = Campaign {
            id: campaign_id,
            creator,
            title,
            description,
            goal,
            deadline,
            raised: 0,
            withdrawn: false,
        };

        set_campaign(&env, &campaign);

        count += 1;
        env.storage().persistent().set(&DataKey::CampaignCount, &count);

        campaign_id
    }

    pub fn contribute(env: Env, contributor: Address, campaign_id: u32, amount: i128) {
        contributor.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, CrowdfundError::AmountMustBePositive);
        }

        let mut campaign = get_campaign_or_panic(&env, campaign_id);

        let now = env.ledger().timestamp();
        if now >= campaign.deadline {
            panic_with_error!(&env, CrowdfundError::CampaignEnded);
        }

        let token_address = get_token(&env);
        let token_client = token::Client::new(&env, &token_address);

        token_client.transfer(&contributor, &env.current_contract_address(), &amount);

        campaign.raised += amount;
        set_campaign(&env, &campaign);

        let existing = get_contribution_internal(&env, campaign_id, contributor.clone());
        let updated = existing + amount;

        env.storage()
            .persistent()
            .set(&DataKey::Contribution(campaign_id, contributor), &updated);
    }

    pub fn withdraw(env: Env, creator: Address, campaign_id: u32) {
        creator.require_auth();

        let mut campaign = get_campaign_or_panic(&env, campaign_id);

        if creator != campaign.creator {
            panic_with_error!(&env, CrowdfundError::NotCampaignCreator);
        }

        if campaign.raised < campaign.goal {
            panic_with_error!(&env, CrowdfundError::GoalNotReached);
        }

        if campaign.withdrawn {
            panic_with_error!(&env, CrowdfundError::AlreadyWithdrawn);
        }

        let token_address = get_token(&env);
        let token_client = token::Client::new(&env, &token_address);

        token_client.transfer(&env.current_contract_address(), &creator, &campaign.raised);

        campaign.withdrawn = true;
        set_campaign(&env, &campaign);
    }

    pub fn refund(env: Env, contributor: Address, campaign_id: u32) {
        contributor.require_auth();

        let mut campaign = get_campaign_or_panic(&env, campaign_id);

        let now = env.ledger().timestamp();
        if now < campaign.deadline {
            panic_with_error!(&env, CrowdfundError::CampaignStillActive);
        }

        if campaign.raised >= campaign.goal {
            panic_with_error!(&env, CrowdfundError::GoalAlreadyReached);
        }

        let contribution = get_contribution_internal(&env, campaign_id, contributor.clone());
        if contribution <= 0 {
            panic_with_error!(&env, CrowdfundError::NothingToRefund);
        }

        let token_address = get_token(&env);
        let token_client = token::Client::new(&env, &token_address);

        token_client.transfer(&env.current_contract_address(), &contributor, &contribution);

        env.storage()
            .persistent()
            .set(&DataKey::Contribution(campaign_id, contributor), &0i128);

        campaign.raised -= contribution;
        set_campaign(&env, &campaign);
    }

    pub fn get_campaign(env: Env, campaign_id: u32) -> Campaign {
        get_campaign_or_panic(&env, campaign_id)
    }

    pub fn get_campaign_count(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }

    pub fn get_contribution(env: Env, campaign_id: u32, contributor: Address) -> i128 {
        get_contribution_internal(&env, campaign_id, contributor)
    }
}
