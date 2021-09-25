import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { createPicassoComponent, Text, TouchableOpacity, View } from 'react-native-picasso';
import { useRecoilState, useRecoilValue } from 'recoil';
import walletState from '../state/atoms/wallet.atom';

const PicassoInput = createPicassoComponent(TextInput);

const ReceiveScreen: React.FC = () => {
  const wallet = useRecoilValue(walletState);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [invoice, setInvoice] = useState('');

  const handleCreateInvoice = async () => {
    const inv = await wallet?.createInvoice(Number(amount), description);

    if (inv) {
      setInvoice(inv);
    }
    console.log(invoice);
  };

  return (
    <View>
      <PicassoInput onChangeText={newAmt => setAmount(newAmt)} placeholder="Amount" className="bg-white m-md p-md b-1 br-md bc-primary r-sm" />
      <PicassoInput onChangeText={newDesc => setDescription(newDesc)} placeholder="Description" className="bg-white mx-md p-md b-1 br-md bc-primary r-sm" />
      <TouchableOpacity onPress={handleCreateInvoice} className="m-md bg-primary p-md r-sm">
        <Text className="c-white w-bold a-c">Request</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReceiveScreen;
