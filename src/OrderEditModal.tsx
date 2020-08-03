import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { Orders, ValidationErrors, validateOrders } from './utils';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import { ValidationErrorAlerts } from './ValidationErrors';

export interface OrderEditModalProps {
  open: boolean;
  onClose: () => any;
  orders?: Orders;
  onSave: (value: Orders) => any;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    textarea: {
      fontSize: '0.85rem',
    },
    errorData: {
      wordWrap: 'break-word',
    },
  })
);

export function OrderEditModal({
  open,
  onClose,
  orders,
  onSave,
}: OrderEditModalProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [error, setError] = React.useState<any>();
  const [validationError, setValidationError] = React.useState<
    ValidationErrors
  >();

  const initialInputText = React.useMemo(() => {
    setError(undefined);

    try {
      const str = orders ? JSON.stringify(orders, undefined, 2) : '';
      return str;
    } catch (e) {
      setError(e);
      return '';
    }
  }, [orders, setError]);

  const _onSave = React.useCallback(() => {
    setError(undefined);
    setValidationError(undefined);
    const val = inputRef.current?.value || '';

    try {
      const newData = JSON.parse(val);
      const { isValid, errors } = validateOrders(newData);

      if (!isValid) {
        setError('Invalid data has been provided.');
        setValidationError(errors);
        return;
      }

      onSave(newData);
      onClose();
    } catch (e) {
      console.warn(e);
      setError('Invalid JSON');
    }
  }, [onClose, inputRef, onSave, setValidationError, setError]);

  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      fullWidth
    >
      <DialogTitle id="form-dialog-title">Edit Orders</DialogTitle>
      <DialogContent>
        <ValidationErrorAlerts validationErrors={validationError} />
        <TextField
          inputProps={{
            ref: inputRef,
          }}
          autoFocus
          margin="dense"
          id="order-data"
          label="Order Details"
          type="text"
          fullWidth
          multiline
          defaultValue={initialInputText}
          error={error}
          helperText={error}
          className={classes.textarea}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default" variant="outlined">
          Cancel
        </Button>
        <Button onClick={_onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
