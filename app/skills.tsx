import { router } from 'expo-router';
import { Button, View } from 'react-native';

export default function SkillsScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        gap: 20,
        padding: 20,
      }}
    >
      <Button
        title="Shooting"
        onPress={() =>
          router.push({
            pathname: '/drills',
            params: { skill: 'shooting' },
          })
        }
      />

      <Button
        title="Passing"
        onPress={() =>
          router.push({
            pathname: '/drills',
            params: { skill: 'passing' },
          })
        }
      />

      <Button
        title="Dribbling"
        onPress={() =>
          router.push({
            pathname: '/drills',
            params: { skill: 'dribbling' },
          })
        }
      />
    </View>
  );
}