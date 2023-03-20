import axios from 'axios';
import { createContext, useCallback, useEffect, useState } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
	const [username, setUserName] = useState(null);
	const [id, setId] = useState(null);

	const fetchUserProfile = useCallback(async () => {
		try {
			const res = await axios.get('/profile');
			setId(res.data.userId);
			setUserName(res.data.username);
		} catch (error) {
			return error;
		}
	});

	useEffect(() => {
		fetchUserProfile();
	}, [fetchUserProfile]);
	return (
		<UserContext.Provider value={{ username, setUserName, id, setId }}>
			{children}
		</UserContext.Provider>
	);
}
