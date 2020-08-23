import { getPathProvider } from '../../src/service/pathProviderService';
import { mPost } from '../helpers/test.helper';
import path from 'path';

describe('service/pathProviderService', () => {
	const dir1 = 'dir1';
	const dir2 = 'dir2';
	const directory = `${dir1}/${dir2}`;
	const hash = 'someposthash';
	const imagename = 'imagename.png';
	const post = mPost({ directory, hash, image: imagename });
	const basePath = '/tmp/booruplus';
	const service = getPathProvider(basePath);

	it('getImagePath() returns correct result', () => {
		// given
		// when
		const result = service.getImagePath(post);

		// then
		expect(result).toBe(path.join(basePath, 'images', post.directory, post.image));
	});
	it('getThumbnailPath() returns correct result', () => {
		// given
		// when
		const result = service.getThumbnailPath(post);

		// then
		expect(result).toBe(path.join(basePath, 'thumbnails', post.directory, post.hash).concat('.jpg'));
		// then
	});
	it('getImageDirsPaths() returns correct result', () => {
		// given
		// when
		const [inner, outer] = service.getImageDirsPaths(post);

		// then
		expect(inner).toBe(path.join(basePath, 'images', dir1, dir2));
		expect(outer).toBe(path.join(basePath, 'images', dir1));
	});
	it('getThumbnailDirsPaths() returns correct result', () => {
		// given
		// when
		const [inner, outer] = service.getThumbnailDirsPaths(post);

		// then
		expect(inner).toBe(path.join(basePath, 'thumbnails', dir1, dir2));
		expect(outer).toBe(path.join(basePath, 'thumbnails', dir1));
	});
	it('getImageDirPath() returns correct result', () => {
		// given
		// when
		const result = service.getImageDirPath(post);

		// then
		expect(result).toBe(path.join(basePath, 'images', post.directory));
	});
	it('getThumbnailDirPath() returns correct result', () => {
		// given
		// when
		const result = service.getThumbnailDirPath(post);

		// then
		expect(result).toBe(path.join(basePath, 'thumbnails', post.directory));
	});
});
