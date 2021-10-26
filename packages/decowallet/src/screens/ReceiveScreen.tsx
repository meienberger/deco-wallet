import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { createPicassoComponent, Text, TouchableOpacity, View } from 'react-native-picasso';
import { useRecoilValue } from 'recoil';
import QRCode from 'react-native-qrcode-svg';
import walletState from '../state/atoms/wallet.atom';
import LNDHubService from '../services/lndhub.service';

const PicassoInput = createPicassoComponent(TextInput);

const ReceiveScreen: React.FC = () => {
  const wallet = useRecoilValue(walletState);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [invoice, setInvoice] = useState('');

  const handleCreateInvoice = async () => {
    if (wallet) {
      const inv = await LNDHubService.createInvoice(Number(amount), description, wallet?.accessToken);

      if (inv) {
        setInvoice(inv);
      }
    }
  };

  return (
    <View>
      <PicassoInput onChangeText={newAmt => setAmount(newAmt)} placeholder="Amount" className="bg-white m-md p-md b-1 br-md bc-primary r-sm" />
      <PicassoInput onChangeText={newDesc => setDescription(newDesc)} placeholder="Description" className="bg-white mx-md p-md b-1 br-md bc-primary r-sm" />
      <TouchableOpacity onPress={handleCreateInvoice} className="m-md bg-primary p-md r-sm">
        <Text className="c-white w-bold a-c">Request</Text>
      </TouchableOpacity>
      <View className="ai-c mt-sm">{Boolean(invoice) && <QRCode size={300} value={invoice} />}</View>
    </View>
  );
};

export default ReceiveScreen;
