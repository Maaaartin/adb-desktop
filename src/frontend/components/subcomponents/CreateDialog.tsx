import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';

const CreateDialog = (props: {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
}) => {
  const { open, onClose, onConfirm, title, label } = props;
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue('');
  }, [open]);
  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onConfirm(value)}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDialog;
