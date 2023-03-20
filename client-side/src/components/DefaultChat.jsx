export default function DefaultChatPage() {
	return (
		<div className='p-10 justify-center '>
			<div className='flex gap-2 items-center text-2xl text-white p-10'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
					className='w-6 h-6'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5'
					/>
				</svg>
				Select a contact to start chatting
			</div>
			<div>Add suggestions here</div>
		</div>
	);
}

/**
 * maybe add suggestions, or show people you chatted with in past
 */
