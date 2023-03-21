import { generateFromString } from 'generate-avatar';
export default function ContactCard({ name, id, isSelected, isOnline }) {
	return (
		<div
			className={
				'flex items-center gap-2 p-3 rounded-xl cursor-pointer ' +
				(isSelected
					? 'bg-background shadow-lg'
					: 'transition-all hover:bg-highlight hover:text-background')
			}>
			<div
				className={
					'flex relative w-10 h-10 items-center rounded-full shadow-md shadow-gray-light  border-2 ' +
					(isOnline ? 'border-lime-400' : 'border-slate-400')
				}>
				<img
					className='rounded-full'
					src={`data:image/svg+xml;utf8,${generateFromString(id)}`}
				/>
				<div
					className={
						'w-3 h-3 absolute rounded-full bottom-0 right-0 ' +
						(isOnline ? ' bg-lime-400' : ' bg-slate-400')
					}></div>
			</div>

			<div>{name}</div>
		</div>
	);
}
