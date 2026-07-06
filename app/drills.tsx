import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { drills } from '../constants/drills';

export default function DrillScreen() {
  const { skill } = useLocalSearchParams();

  const selectedDrills =
    drills[skill as keyof typeof drills] || [];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        gap: 20,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        {skill}
      </Text>

      {selectedDrills.map((drill) => (
        <Button
          key={drill}
          title={drill}
          onPress={() =>
            router.push({
              pathname: '/setup',
              params: { drill, skill },
            })
          }
        />
      ))}
    </View>
  );
}