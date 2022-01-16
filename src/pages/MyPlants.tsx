import { formatDistance } from 'date-fns'
import enUS from 'date-fns/esm/locale/en-US/index.js'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native'
import waterdrop from '../assets/waterdrop.png'
import { Header } from '../components/Header'
import { Load } from '../components/Load'
import { PlantCardSecondary } from '../components/PlantCardSecondary'
import { loadPlant, PlantProps, removePlant } from '../libs/storage'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

export function MyPlants() {
  const [myPlants, setMyPlants] = useState<PlantProps[]>([])
  const [loading, setLoading] = useState(true)
  const [nextWatered, setNextWatered] = useState<string>()

  function handleRemove(plant: PlantProps) {
    Alert.alert('Remove', `Do you want to remove ${plant.name}?`, [
      {
        text: 'No 🙏🏻',
        style: 'cancel',
      },
      {
        text: 'Yes 😥',
        onPress: async () => {
          try {
            await removePlant(plant.id)

            setMyPlants((oldData) =>
              oldData.filter((item) => item.id !== plant.id)
            )
          } catch (error) {
            Alert.alert('Error removing plant! 😥')
          }
        },
      },
    ])
  }

  async function loadStorageData() {
    const plantsStored = await loadPlant()

    if (plantsStored.length > 0) {
      const nextTime = formatDistance(
        new Date(plantsStored[0].dateTimeNotification).getTime(),
        new Date().getTime(),
        {
          locale: enUS,
        }
      )
      setNextWatered(`Water your ${plantsStored[0].name} in ${nextTime}`)
    } else {
      setNextWatered(`No reminders added yet.`)
    }

    setMyPlants(plantsStored)
    setLoading(false)
  }

  useEffect(() => {
    loadStorageData()
  }, [myPlants])

  if (loading) return <Load />

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.spotlight}>
        <Image source={waterdrop} style={styles.spotlightImage} />
        <Text style={styles.spotlightText}>{nextWatered}</Text>
      </View>

      <View style={styles.plants}>
        <Text style={styles.plantsTitle}>Next Watering</Text>

        <FlatList
          data={myPlants}
          keyExtractor={(item) => String(item.id)} // Best practice to improve performance
          renderItem={({ item }) => (
            <PlantCardSecondary
              data={item}
              handleRemove={() => {
                handleRemove(item)
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ flex: 1 }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  spotlight: {
    backgroundColor: colors.blue_light,
    paddingHorizontal: 20,
    borderRadius: 20,
    height: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotlightImage: {
    width: 60,
    height: 60,
  },
  spotlightText: {
    flex: 1,
    color: colors.blue,
    paddingHorizontal: 20,
  },
  plants: {
    flex: 1,
    width: '100%',
  },
  plantsTitle: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: colors.heading,
    marginVertical: 20,
  },
})
