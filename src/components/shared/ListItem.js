import React from 'react';
import {ListItem, Icon} from 'react-native-elements';
import {Clipboard} from 'react-native';
import {format} from 'date-fns';
import {theme} from '../../../App';

const Item = ({data}) => {
  const handleCopy = () => {
    Clipboard.setString(data.trackingId);
    alert('Կոդը պատճենված է');
  };

  return (
    <ListItem key={data.id} bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{data.trackingId}</ListItem.Title>
        <ListItem.Subtitle>{data.destinationProvenceState}</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Content>
        <ListItem.Title>Ստեղծման ամսաթիվ</ListItem.Title>
        <ListItem.Subtitle>
          {' '}
          {format(new Date(data?.createDate), 'dd/MM/yyyy')}
        </ListItem.Subtitle>
      </ListItem.Content>
      <Icon
        name="edit"
        onPress={handleCopy}
        size={20}
        color={theme.colors.primary}
      />
    </ListItem>
  );
};

export default Item;
