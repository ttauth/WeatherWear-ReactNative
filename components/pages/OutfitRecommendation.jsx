import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import WeatherDataContext from '../../context/WeatherDataContext';
import WeatherAPITools from '../../utils/weatherTools';
import AddClothes from '../AddClothes';

const defaultClothingItems = {
  Tops: [
    { name: 'T-shirt', temperature: { min: 60, max: Infinity } },
    { name: 'Sweatshirt', temperature: { min: 35, max: 60 } },
    { name: 'Tanktop', temperature: { min: 60, max: Infinity } },
    { name: 'Puffer Jacket', temperature: { min: -Infinity, max: 35 } },
    { name: 'Parka', temperature: { min: -Infinity, max: 35 } },
  ],
  Bottoms: [
    { name: 'Jeans', temperature: { min: -Infinity, max: Infinity } },
    { name: 'Shorts', temperature: { min: 60, max: Infinity } },
    { name: 'Sweatpants', temperature: { min: 30, max: Infinity } },
    { name: 'Cargo Pants', temperature: { min: 30, max: Infinity } },
  ],
  Footwear: [
    { name: 'Sneakers', temperature: { min: 30, max: Infinity } },
    { name: 'Sandals', temperature: { min: 60, max: Infinity } },
    { name: 'Winter Boots', temperature: { min: -Infinity, max: 35 } },
    { name: 'Timbs', temperature: { min: 30, max: Infinity } },
  ],
};

const OutfitRecommendation = () => {
  const [addingClothes, setAddingClothes] = useState(false);
  const [wardrobe, setWardrobe] = useState({
    Tops: [],
    Bottoms: [],
    Footwear: [],
  });

  const [recommendedItems, setRecommendedItems] = useState({});
  const [currentTemperature, setCurrentTemperature] = useState('');
  const [cityAndState, setCityAndState] = useState('');
  const weatherData = useContext(WeatherDataContext);

  const fetchWeatherDetailsAndRecommendOutfit = async () => {
    try {
      const tools = new WeatherAPITools(weatherData);
      const [temp] = tools.getCurrentWeather();
      setCurrentTemperature(temp);
      recommendOutfitBasedOnTemperature(parseFloat(temp));

      const [city, state] = tools.getLocationDetails();
      setCityAndState(`${city}, ${state}`);
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to fetch weather data: ${error.message || error}`
      );
    }
  };

  //useEffect(() => {
  //  fetchWeatherDetailsAndRecommendOutfit();
  //}, [weatherData]);

  const recommendOutfitBasedOnTemperature = (temperature) => {
    let newRecommendedItems = {};

    Object.keys(wardrobe).forEach((category) => {
      // Filter all items that match the temperature criteria
      const matchingItems = wardrobe[category].filter((item) => {
        const minTemp = item.temperature.min;
        const maxTemp =
          item.temperature.max === Infinity
            ? Number.MAX_VALUE
            : item.temperature.max;

        return temperature >= minTemp && temperature <= maxTemp;
      });

      // Randomly select one of the matching items
      if (matchingItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingItems.length);
        const matchedItem = matchingItems[randomIndex];
        newRecommendedItems[
          category
        ] = `${matchedItem.color} ${matchedItem.name}`;
      } else {
        newRecommendedItems[category] = 'No item found';
      }
    });
    console.log(newRecommendedItems);
    setRecommendedItems(newRecommendedItems);
  };

  // Function to add a new clothing item to the wardrobe
  const handleAddClothes = (newItem) => {
    console.log('Adding new item:', newItem);
    if (!wardrobe[newItem.category]) {
      Alert.alert('Error', 'Invalid category');
      return;
    }

    setWardrobe((currentWardrobe) => {
      const updatedWardrobe = {
        ...currentWardrobe,
        [newItem.category]: [...currentWardrobe[newItem.category], newItem],
      };
      console.log('Updated wardrobe:', updatedWardrobe);
      return updatedWardrobe;
    });
  };

  return (
    <View style={styles.container}>
      {addingClothes ? (
        <AddClothes
          onAddClothes={handleAddClothes}
          onFinish={() => setAddingClothes(false)}
        />
      ) : (
        <>
          <Text style={styles.locationText}>Location: {cityAndState}</Text>
          <Text style={styles.temperatureText}>
            Current Temperature: {currentTemperature}°F
          </Text>
          {Object.keys(recommendedItems).length > 0 && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationText}>
                Outfit Recommendation:
              </Text>
              {Object.keys(recommendedItems).map((category) => {
                // Extract the item string from recommendedItems
                const itemString = recommendedItems[category];

                return (
                  <Text key={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}:
                    {itemString !== 'No item found'
                      ? itemString
                      : `No suitable ${category.toLowerCase()} found`}
                  </Text>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={fetchWeatherDetailsAndRecommendOutfit}
          >
            <Text style={styles.buttonText}>Generate New Outfit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setAddingClothes(true)}
          >
            <Text style={styles.buttonText}>Add Clothes</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  recommendationContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  recommendationText: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  temperatureText: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 10,
  },
  locationText: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 10,
  },
});

export default OutfitRecommendation;
