import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    id: bigint;
    content: string;
    role: string;
    timestamp: bigint;
}
export interface FamilyMember {
    nom: string;
    maladieY: boolean;
    maladies: string;
    garantir: string;
    stade: string;
    dateNaissance: string;
    formule: string;
    antecedents: string;
}
export interface Policy {
    statut: string;
    type: string;
    famille: Array<FamilyMember>;
    couverture: {
        maladiesGraves: bigint;
        hospitalisation: bigint;
        soinsAmbulatoires: bigint;
    };
    garanties: Array<Guarantee>;
    numero: string;
}
export interface Guarantee {
    service: string;
    code: string;
    risque: string;
    intervention: string;
    montant: bigint;
    pourcentage: bigint;
}
export interface backendInterface {
    addPolicy(numero: string, policy: Policy): Promise<void>;
    getChatMessages(): Promise<Array<Message>>;
    getFamilyMembers(policyNumber: string): Promise<Array<FamilyMember>>;
    getGuarantees(policyNumber: string): Promise<Array<Guarantee>>;
    getPolicyDetails(policyNumber: string): Promise<Policy | null>;
    initializePolicy(numero: string): Promise<void>;
    resetChatForUser(user: Principal): Promise<void>;
    sendMessage(content: string): Promise<Message>;
}
