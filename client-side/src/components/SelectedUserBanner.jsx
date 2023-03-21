import { generateFromString } from 'generate-avatar';

export default function Banner({ userId, username }) {
	return (
		<div className='flex h-20 gap-2 -mx-2 rounded-xl p-2 items-center bg-background  shadow-lg'>
			<img
				className='rounded-full h-16 w-16'
				src={`data:image/svg+xml;utf8,${generateFromString(userId)}`}
			/>
			<div className='text-white text-2xl font-bold'>{username}</div>
		</div>
	);
}
