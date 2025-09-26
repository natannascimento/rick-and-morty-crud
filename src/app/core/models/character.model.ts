export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';
export type CharacterGender = 'Female' | 'Male' | 'Genderless' | 'unknown';

export interface Reference {
  name: string;
  url: string;
}

export interface Character {
  id: number;                 
  name: string;               
  status: CharacterStatus;    
  species: string;            
  type?: string;              
  gender: CharacterGender;    
  origin: Reference;          
  location: Reference;        
  image?: string;             
  episode?: string[];         
  url?: string;               
  created?: string;
  _local?: boolean;          
  _updatedAt?: string;       
}
export interface ApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}