import React from 'react';
import {ListItem, Icon} from 'react-native-elements';
import {Clipboard, StyleSheet} from 'react-native';
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
        <ListItem.Title style={styles.title}>{data.trackingId}</ListItem.Title>
        <ListItem.Subtitle style={styles.subTitle}>
          {data.destinationProvenceState}
        </ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Content>
        <ListItem.Subtitle style={styles.title}>
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

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
  },
  subTitle: {
    fontSize: 18,
  },
});

export default Item;
