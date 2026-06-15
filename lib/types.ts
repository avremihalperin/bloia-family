export type Gender = "male" | "female" | "other" | null;

export type FamilyPosition =
  | "father"
  | "mother"
  | "child"
  | "spouse"
  | "eldest"
  | "youngest"
  | string
  | null;

export interface Person {
  id: string;
  full_name: string;
  nickname: string | null;
  birth_date_gregorian: string | null;
  birth_date_hebrew: string | null;
  photo_url: string | null;
  residence: string | null;
  phone: string | null;
  generation: number | null;
  family_position: FamilyPosition;
  gender: Gender;
  parent_id: string | null;
  spouse_id: string | null;
  branch_id: string | null;
  created_by: string | null;
  claimed_by: string | null;
  is_placeholder: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  root_person_id: string | null;
  label: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  token: string;
  target_person_id: string | null;
  parent_person_id: string | null;
  created_by: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface AppSettings {
  id: number;
  family_password_hash: string | null;
  tree_name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  person_id: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface TreeNode {
  id: string;
  name: string;
  nickname: string | null;
  generation: number | null;
  photo_url: string | null;
  birthYear: string | null;
  gender: Gender;
  children: TreeNode[];
  spouse?: TreeNode;
}

export interface PersonFormData {
  full_name: string;
  nickname?: string;
  birth_date_gregorian?: string;
  birth_date_hebrew?: string;
  residence?: string;
  phone?: string;
  family_position?: string;
  gender?: Gender;
  parent_id?: string;
}
