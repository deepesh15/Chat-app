import { generateFromString } from 'generate-avatar';
export default function ContactCard({
	username: name,
	userId: id,
	isSelected,
	isOnline = false,
}) {
	console.log(isOnline);
	return (
		<div>
			<div
				className={
					'flex items-center gap-2 p-3 border-b-2 border-gray-light cursor-pointer ' +
					(isSelected
						? 'bg-gray-light '
						: 'transition-all hover:bg-blue-highlight')
				}>
				<div className='flex relative w-10 h-10 items-center rounded-full shadow-md shadow-gray-light  border-2 border-white'>
					<img
						className='rounded-full'
						src={`data:image/svg+xml;utf8,${generateFromString(id)}`}
					/>
					<div
						className={
							'w-2 h-2 absolute rounded-full bottom-0 right-0 ' +
							(isOnline ? ' bg-green-500' : ' bg-red-500')
						}></div>
				</div>

				<div className='text-white'>{name}</div>
			</div>
		</div>
	);
}
