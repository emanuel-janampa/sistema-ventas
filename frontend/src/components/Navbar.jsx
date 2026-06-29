import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
	const navigate = useNavigate();
	const username = localStorage.getItem('username') || 'Usuario';
	const [anchorEl, setAnchorEl] = useState(null);

	const handleOpen = (event) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleLogout = () => {
		localStorage.clear();
		navigate('/login');
	};

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#111827' }}>
						Sistema Ventas
					</Typography>

					<Tooltip title={username}>
						<IconButton onClick={handleOpen} size="small" sx={{ ml: 2 }}>
							<Avatar sx={{ width: 32, height: 32 }}>{username.charAt(0).toUpperCase()}</Avatar>
						</IconButton>
					</Tooltip>

					<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} onClick={handleClose} PaperProps={{ sx: { mt: 1.5 } }}>
						<MenuItem onClick={() => navigate('/perfil')}>Perfil</MenuItem>
						<MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
