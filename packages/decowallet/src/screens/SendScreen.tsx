import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native-picasso';
import { useRecoilValue } from 'recoil';
import LNDHubService from '../services/lndhub.service';
import walletState from '../state/atoms/wallet.atom';

const SendScreen: React.FC = () => {
  const wallet = useRecoilValue(walletState);
  const [invoice, setInvoice] = useState(
    'lntb10u1ps4vg7zpp5sdwjq4hllsp43vmyjd3w6ykydpalk9h2s9ysrdwzucllt63wx9ysdqgt9hk7mm0cqzpgxqyz5vqsp5ca2av4myzxt3sfacvfy03ytt0srt6yy56rdqkfc0v2y4txg8ut2s9qyyssqxt5lcglaj8klqx465vh29fk2c535pzyqxvpqzs7a9p5g3vks52v4m30ld28xv6vknanwsrl7z0ckgpyp26nql79ju6z6szfqpa553uqq35ul4m',
  );

  useEffect(() => {
    const test = LNDHubService.decodeInvoice(invoice);

    console.log(test);
  }, [invoice]);

  const handlePayInvoice = () => {
    LNDHubService.payInvoice(wallet?.accessToken, invoice);
  };

  return (
    <View>
      <TextInput value={invoice} autoCorrect={false} autoCapitalize="none" onChangeText={inv => setInvoice(inv)} placeholder="Invoice" className="bg-white m-md p-md b-1 br-md bc-primary r-sm" />
      <TouchableOpacity onPress={handlePayInvoice} className="m-md bg-primary p-md r-sm">
        <Text className="c-white w-bold a-c">Request</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendScreen;
