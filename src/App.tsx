import React from 'react';
import './App.css';
import { LocationTotals } from './LocationTotals';
import { Totals } from './Totals';
import { LocationOrders } from './LocationOrders';
import { OrderEditModal } from './OrderEditModal';
import { Orders } from './utils';

import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  ThemeProvider,
  makeStyles,
  createStyles,
} from '@material-ui/core/styles';

import { theme } from './theme';
import { useOrders, Provider as OrderProvider } from './Context';
import { Toolbar, AppBar } from '@material-ui/core';
import Labels from './Labels';

const useStyles = makeStyles((theme) =>
  createStyles({
    mr2: {
      marginRight: theme.spacing(2),
    },
    mlAuto: {
      marginLeft: 'auto',
    },
    logo: {
      height: '3.4rem',
      marginRight: theme.spacing(3),
    },
    tabs: {
      margin: 'auto',
    },
  })
);

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <OrderProvider>
        <BBKExport />
      </OrderProvider>
    </ThemeProvider>
  );
}

function BBKExport() {
  const { setWorkingOrders, refreshOrders, workingOrders, error } = useOrders();

  const [editing, setEditing] = React.useState(false);
  const toggleEdit = React.useCallback(() => setEditing((s) => !s), [
    setEditing,
  ]);

  const onSave = React.useCallback(
    (newOrders: Orders) => {
      setWorkingOrders(newOrders);
    },
    [setWorkingOrders]
  );

  const [tab, setTab] = React.useState(0);

  const handleChange = React.useCallback(
    (event: any, newValue: number) => {
      setTab(newValue);
    },
    [setTab]
  );

  const classes = useStyles();

  return (
    <div className="order-export">
      <AppBar color="transparent" position="relative">
        <Toolbar>
          <img
            src="https://cdn.shopify.com/s/files/1/0094/1312/t/8/assets/logo.png?v=2859877849780081869"
            className={classes.logo}
          />

          {workingOrders ? (
            <>
              <Button
                onClick={toggleEdit}
                className={classes.mlAuto}
                variant="outlined"
                color="default"
              >
                Edit
              </Button>
              <OrderEditModal
                open={editing}
                onClose={toggleEdit}
                onSave={onSave}
                orders={workingOrders}
              />
            </>
          ) : null}
        </Toolbar>
      </AppBar>
      <Toolbar>
        <Tabs
          value={tab}
          onChange={handleChange}
          centered
          className={classes.tabs}
        >
          <Tab label="Overview" disabled={!workingOrders} />
          <Tab label="Locations" disabled={!workingOrders} />
          <Tab label="Orders" disabled={!workingOrders} />
          <Tab label="Labels" disabled={!workingOrders} />
        </Tabs>
      </Toolbar>
      {workingOrders && tab === 0 ? <Totals orders={workingOrders} /> : null}
      {workingOrders && tab === 1 ? (
        <LocationTotals orders={workingOrders} />
      ) : null}
      {workingOrders && tab === 2 ? (
        <LocationOrders orders={workingOrders} />
      ) : null}
      {workingOrders && tab === 3 ? <Labels orders={workingOrders} /> : null}
      <Loading />
    </div>
  );
}

const useLoadingStyles = makeStyles((theme) =>
  createStyles({
    loading: {
      marginTop: theme.spacing(10),
      color: theme.palette.grey[700],
      fontSize: `1.2rem`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    progress: {
      width: '100%',
      marginTop: theme.spacing(5),
      maxWidth: 300,
    },
  })
);

export function Loading() {
  const {
    loading,
    count,
    total,
    workingOrders,
    refreshOrders,
    error,
  } = useOrders();

  const classes = useLoadingStyles();

  return (
    <div className={classes.loading}>
      {loading && typeof count !== 'number' ? (
        <>Fetching Orders...</>
      ) : loading ? (
        <>
          Getting order {count} of {total}
        </>
      ) : !workingOrders ? (
        <Button onClick={refreshOrders} color="secondary" variant="contained">
          Run Export
        </Button>
      ) : error ? (
        <div>There was an error fetching orders.</div>
      ) : null}
      {loading ? (
        <div className={classes.progress}>
          <LinearProgress
            variant={
              typeof count === 'number' ? 'determinate' : 'indeterminate'
            }
            value={
              typeof count === 'number' && typeof total === 'number'
                ? (count / total) * 100
                : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export default BBKExport;
