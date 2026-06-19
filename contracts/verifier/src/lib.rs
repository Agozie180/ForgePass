#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, Symbol};

#[contracttype]
enum DataKey { Admin, Verifier, Paused, Nullifier(BytesN<32>) }

#[contracttype]
#[derive(Clone)]
pub struct VerificationReceipt {
    pub holder: Address,
    pub policy_id: BytesN<32>,
    pub proof_commitment: BytesN<32>,
    pub public_inputs_commitment: BytesN<32>,
    pub nullifier: BytesN<32>,
    pub proof_type: Symbol,
    pub issued_at: u64,
    pub expires_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error { Paused = 1, Expired = 2, Replay = 3, InvalidTime = 4 }

#[contract]
pub struct ForgePassVerifier;

#[contractimpl]
impl ForgePassVerifier {
    pub fn initialize(env: Env, admin: Address, verifier: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "initialized");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Verifier, &verifier);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    // The authorized address represents the off-chain Barretenberg verifier.
    // Production upgrades replace this single role with threshold authorization.
    pub fn verify_and_consume(env: Env, receipt: VerificationReceipt) -> Result<BytesN<32>, Error> {
        if env.storage().instance().get(&DataKey::Paused).unwrap_or(false) { return Err(Error::Paused); }
        let verifier: Address = env.storage().instance().get(&DataKey::Verifier).unwrap();
        verifier.require_auth();
        receipt.holder.require_auth();
        let now = env.ledger().timestamp();
        if receipt.issued_at > now { return Err(Error::InvalidTime); }
        if receipt.expires_at < now { return Err(Error::Expired); }
        let key = DataKey::Nullifier(receipt.nullifier.clone());
        if env.storage().persistent().has(&key) { return Err(Error::Replay); }
        env.storage().persistent().set(&key, &receipt.proof_commitment);
        env.events().publish((Symbol::new(&env, "proof_verified"), receipt.proof_type), receipt.nullifier.clone());
        Ok(receipt.proof_commitment)
    }

    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &paused);
    }

    pub fn rotate_verifier(env: Env, verifier: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Verifier, &verifier);
    }
}
