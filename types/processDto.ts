export interface LoadPostDto {
	id: number;
	name: string;
	directory: string;
}

export interface SavePostDto {
	id: number;
	data: string;
	name: string;
	directory: string;
}

export interface LoadedImageDto {
	id: number;
	data: string;
}
