export interface Responsable {
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
  }
  
  export interface Emergencia {
    domicilio?: string;
    telefono?: string;
    email?: string;
  }
  
  export interface Mascota {
    id: string;
    iconoEmoji: string; 
    foto?: string; 
    nombre: string;
    primerApellido: string;
    segundoApellido?: string;
    sexo: string;
    especie: string;
    raza: string;
    pais: string;
    estado: string;
    municipio: string;
    fechaNacimiento: string;
    fechaAdopcion: string; 
    responsable?: Responsable;
    emergencia?: Emergencia;
    claveRegistro: string; 
  }
  