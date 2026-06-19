#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, Symbol};

#[contracttype]
enum DataKey { Admin, Verifier, Passport(Address), Claim(BytesN<32>) }

#[contracttype]
#[derive(Clone)]
pub struct Claim {
    pub id: BytesN<32>,
    pub holder: Address,
    pub policy_id: BytesN<32>,
    pub proof_commitment: BytesN<32>,
    pub proof_type: Symbol,
    pub issued_at: u64,
    pub expires_at: u64,
    pub active: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error { PassportExists = 1, MissingPassport = 2, ClaimExists = 3, MissingClaim = 4 }

#[contract]
pub struct ForgePassRegistry;

#[contractimpl]
impl ForgePassRegistry {
    pub fn initialize(env: Env, admin: Address, verifier: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "initialized");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Verifier, &verifier);
    }

    pub fn create_passport(env: Env, holder: Address) -> Result<(), Error> {
        holder.require_auth();
        let key = DataKey::Passport(holder.clone());
        if env.storage().persistent().has(&key) { return Err(Error::PassportExists); }
        env.storage().persistent().set(&key, &env.ledger().timestamp());
        env.events().publish((Symbol::new(&env, "passport_created"),), holder);
        Ok(())
    }

    pub fn register_claim(env: Env, claim: Claim) -> Result<(), Error> {
        let verifier: Address = env.storage().instance().get(&DataKey::Verifier).unwrap();
        verifier.require_auth();
        if !env.storage().persistent().has(&DataKey::Passport(claim.holder.clone())) { return Err(Error::MissingPassport); }
        let key = DataKey::Claim(claim.id.clone());
        if env.storage().persistent().has(&key) { return Err(Error::ClaimExists); }
        env.storage().persistent().set(&key, &claim);
        env.events().publish((Symbol::new(&env, "claim_registered"), claim.proof_type.clone()), claim.id);
        Ok(())
    }

    pub fn revoke_claim(env: Env, claim_id: BytesN<32>) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let key = DataKey::Claim(claim_id.clone());
        let mut claim: Claim = env.storage().persistent().get(&key).ok_or(Error::MissingClaim)?;
        claim.active = false;
        env.storage().persistent().set(&key, &claim);
        env.events().publish((Symbol::new(&env, "claim_revoked"),), claim_id);
        Ok(())
    }

    pub fn get_claim(env: Env, claim_id: BytesN<32>) -> Option<Claim> {
        env.storage().persistent().get(&DataKey::Claim(claim_id))
    }
}
