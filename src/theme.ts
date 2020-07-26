import { Theme, createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#9d0059',
    },
    secondary: {
      main: '#00853e',
    },
  },
  props: {
    MuiAppBar: {
      elevation: 0,
    },
    MuiButton: {
      variant: 'contained',
      disableElevation: true,
    },
  },
});
