import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback // Added this back for proper global keyboard dismissal
} from "react-native";
import { useState } from "react";

// --- HELPER FUNCTIONS ---

const getBMICategory = (bmi) => {
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "Underweight";
  if (bmiValue < 25) return "Normal Weight";
  if (bmiValue < 30) return "Overweight";
  return "Obese";
};

const getBMIColor = (bmi) => {
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "#3498DB"; // Blue
  if (bmiValue < 25) return "#2ECC71"; // Green
  if (bmiValue < 30) return "#F39C12"; // Orange
  return "#E74C3C"; // Red
};

const getHealthTip = (bmi) => {
    const category = getBMICategory(bmi);
    switch (category) {
        case "Underweight":
            return "Consider consulting a nutritionist to ensure you are meeting your dietary needs and promoting healthy weight gain.";
        case "Normal Weight":
            return "Keep up the good work! Maintain a balanced diet and consistent exercise routine for optimal health.";
        case "Overweight":
            return "Focus on small, sustainable changes in diet and increase daily physical activity. Consistency is key.";
        case "Obese":
            return "It's important to consult a healthcare professional. Developing a structured diet and exercise plan can greatly improve your health.";
        default:
            return "Maintain a healthy lifestyle.";
    }
};


// --- MAIN COMPONENT ---

export default function App() {
  // Metric States (Existing)
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Imperial States (NEW)
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [pounds, setPounds] = useState("");

  const [bmi, setBmi] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  
  // Unit System State (NEW - default to Metric)
  const [unitSystem, setUnitSystem] = useState("Metric"); 
  
  // History State (NEW - stores max 10 entries)
  const [history, setHistory] = useState([]);

  // Function to switch units and clear non-active inputs
  const toggleUnitSystem = (newSystem) => {
    if (newSystem !== unitSystem) {
      setUnitSystem(newSystem);
      setIsCalculated(false); // Reset calculation on unit change
      setBmi("");
      // Clear all inputs for the other system to prevent errors
      setHeight("");
      setWeight("");
      setFeet("");
      setInches("");
      setPounds("");
    }
  };

  // Logic to handle both calculation and clearing (replacing calculateBMI)
  const handleButtonPress = () => {
    // 1. CLEAR / RESET STATE
    if (isCalculated) {
      // Clear all inputs and state for a fresh start
      setHeight("");
      setWeight("");
      setFeet("");
      setInches("");
      setPounds("");
      setBmi("");
      setIsCalculated(false);
      Keyboard.dismiss();
      return;
    }

    // 2. CALCULATION LOGIC
    let heightInMeters = 0;
    let weightInKg = 0;
    let isValid = true;
    let currentHeightCm = 0;
    let currentWeightKg = 0;
    let currentFeet = 0;
    let currentInches = 0;
    let currentPounds = 0;

    // --- METRIC SYSTEM CALCULATION ---
    if (unitSystem === "Metric") {
        const cleanHeight = height.replace(",", ".");
        const cleanWeight = weight.replace(",", ".");
        
        currentHeightCm = parseFloat(cleanHeight);
        currentWeightKg = parseFloat(cleanWeight);

        // Validation & Limits
        if (!cleanHeight || !cleanWeight) {
            alert('Please enter both height (cm) and weight (kg).');
            isValid = false;
        } else if (isNaN(currentWeightKg) || isNaN(currentHeightCm) || currentHeightCm <= 0 || currentWeightKg <= 0) {
            alert('Please enter valid positive numbers for metric units.');
            isValid = false;
        } else if (currentHeightCm < 5 || currentHeightCm > 300) {
            alert('Height must be between 5 cm and 300 cm.');
            isValid = false;
        } else if (currentWeightKg < 0.2 || currentWeightKg > 600) {
            alert('Weight must be between 0.2 kg and 600 kg.');
            isValid = false;
        }

        if (isValid) {
            heightInMeters = currentHeightCm / 100;
            weightInKg = currentWeightKg;
        }

    // --- IMPERIAL SYSTEM CALCULATION ---
    } else { 
        const cleanFeet = feet.replace(",", ".");
        const cleanInches = inches.replace(",", ".");
        const cleanPounds = pounds.replace(",", ".");
        
        currentFeet = parseFloat(cleanFeet);
        currentInches = parseFloat(cleanInches || '0');
        currentPounds = parseFloat(cleanPounds);
        
        const totalInches = currentFeet * 12 + currentInches;

        // Validation
        if (!cleanFeet || !cleanPounds) {
            alert('Please enter height (feet/inches) and weight (lbs).');
            isValid = false;
        } else if (isNaN(totalInches) || isNaN(currentPounds) || totalInches <= 0 || currentPounds <= 0) {
            alert('Please enter valid positive numbers for imperial units.');
            isValid = false;
        } 
        // Imperial specific limits (approximate conversion)
        else if (totalInches < 40 || totalInches > 120 || currentPounds < 4 || currentPounds > 1350) {
            alert('Please enter realistic imperial measurements (e.g., height between 3ft 4in and 10ft).');
            isValid = false;
        }

        if (isValid) {
            // Conversions: 1 lb = 0.453592 kg; 1 inch = 0.0254 m
            weightInKg = currentPounds * 0.453592;
            heightInMeters = totalInches * 0.0254;
        }
    }

    if (isValid) {
        // Final Calculation and state update
        const bmiValue = weightInKg / (heightInMeters * heightInMeters);
        const finalBmi = bmiValue.toFixed(1);
        setBmi(finalBmi);
        setIsCalculated(true); 

        // 3. HISTORY TRACKING LOGIC
        const newEntry = {
            id: Date.now(),
            bmi: finalBmi,
            category: getBMICategory(finalBmi),
            date: new Date().toLocaleDateString(),
            system: unitSystem,
            source: unitSystem === 'Metric' 
                ? `${currentHeightCm} cm / ${currentWeightKg} kg`
                : `${currentFeet}'${currentInches}" / ${currentPounds} lbs`
        };
        // Add new entry and limit array to 10 entries
        setHistory(prevHistory => [newEntry, ...prevHistory].slice(0, 10)); 

        Keyboard.dismiss();
    }
  };

  // Helper functions to conditionally render inputs
  const renderMetricInputs = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="e.g. 175"
          keyboardType="numeric"
          returnKeyType="done"
          editable={!isCalculated}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 70.5"
          keyboardType="numeric"
          returnKeyType="done"
          editable={!isCalculated}
        />
      </View>
    </>
  );

  const renderImperialInputs = () => (
    <>
      {/* Height Inputs (Feet and Inches in one row) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput, {marginRight: 10}]}
            value={feet}
            onChangeText={setFeet}
            placeholder="Feet (ft)"
            keyboardType="numeric"
            returnKeyType="done"
            editable={!isCalculated}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={inches}
            onChangeText={setInches}
            placeholder="Inches (in)"
            keyboardType="numeric"
            returnKeyType="done"
            editable={!isCalculated}
          />
        </View>
      </View>

      {/* Weight Input (Pounds) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          value={pounds}
          onChangeText={setPounds}
          placeholder="e.g. 155"
          keyboardType="numeric"
          returnKeyType="done"
          editable={!isCalculated}
        />
      </View>
    </>
  );


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" 
      > 
        <Text style={styles.title}>BMI Calculator</Text>

        {/* Unit Toggle Switch (+5 pts) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              unitSystem === "Metric" && styles.toggleButtonActive,
            ]}
            onPress={() => toggleUnitSystem("Metric")}
            disabled={isCalculated}
          >
            <Text style={[
                styles.toggleText,
                unitSystem === "Metric" && styles.toggleTextActive,
            ]}>
              Metric (cm/kg)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              unitSystem === "Imperial" && styles.toggleButtonActive,
            ]}
            onPress={() => toggleUnitSystem("Imperial")}
            disabled={isCalculated}
          >
            <Text style={[
                styles.toggleText,
                unitSystem === "Imperial" && styles.toggleTextActive,
            ]}>
              Imperial (ft/lbs)
            </Text>
          </TouchableOpacity>
        </View>

        {/* BMI Reference Guide */}
        <View style={styles.referenceContainer}>
            <Text style={styles.referenceTitle}>BMI Categories</Text>
            <Text style={styles.referenceText}>• Below 18.5: Underweight</Text>
            <Text style={styles.referenceText}>• 18.5 - 24.9: Normal Weight</Text>
            <Text style={styles.referenceText}>• 25.0 - 29.9: Overweight</Text>
            <Text style={styles.referenceText}>• 30.0+: Obese</Text>
        </View>

        {/* Conditional Inputs (NEW) */}
        {unitSystem === "Metric" ? renderMetricInputs() : renderImperialInputs()}

        {/* Calculate / New Calculation Button (Toggle) */}
        <TouchableOpacity
          style={[
            styles.button,
            isCalculated && NEW_CALCULATION_BUTTON_STYLES.button,
          ]}
          onPress={handleButtonPress}
        >
          <Text 
            style={[
                styles.buttonText,
                isCalculated && NEW_CALCULATION_BUTTON_STYLES.buttonText
            ]}
          >
            {isCalculated ? "New Calculation" : "Calculate BMI"}
          </Text>
        </TouchableOpacity>

        {/* Result Display (Conditional Rendering) */}
        {bmi ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Your BMI:</Text>
            <Text style={styles.resultValue}>{bmi}</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getBMIColor(bmi) },
              ]}
            >
              <Text style={styles.categoryText}>{getBMICategory(bmi)}</Text>
            </View>
            
            {/* Health Tips (+3 pts) */}
            <Text style={styles.tipTitle}>Health Tip:</Text>
            <Text style={styles.tipText}>{getHealthTip(bmi)}</Text>

          </View>
        ) : null}
        
        {/* History Tracking (+5 pts) */}
        {history.length > 0 && (
            <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Recent BMI History ({history.length} of 10)</Text>
                {history.map((entry) => (
                    <View key={entry.id} style={styles.historyEntry}>
                        <View style={styles.historyLeft}>
                            <Text style={styles.historyBMI}>
                                {entry.bmi}
                            </Text>
                            <Text style={[styles.historyCategory, { color: getBMIColor(entry.bmi) }]}>
                                {entry.category}
                            </Text>
                        </View>
                        <View style={styles.historyDetails}>
                            <Text style={styles.historyDate}>{entry.date} ({entry.system})</Text>
                            <Text style={styles.historySource}>{entry.source}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}

      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

// --- STYLES ---

const NEW_CALCULATION_BUTTON_STYLES = StyleSheet.create({
    button: {
        backgroundColor: "#E1E8EE", 
        borderColor: "#7F8C8D",
        borderWidth: 2,
        shadowColor: "transparent", 
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 20,
        elevation: 0, 
    },
    buttonText: {
        color: "#34495E",
        fontSize: 20,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
});


const styles = StyleSheet.create({
  // --- LAYOUT & BASE ---
  scrollView: {
    flex: 1, 
    backgroundColor: "#F0F4F8", 
  },
  container: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: 800,
  },
  row: { // NEW: For Imperial inputs (feet/inches)
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: { // NEW: For Imperial inputs
    flex: 1,
  },
  // --- TYPOGRAPHY & ELEMENTS ---
  title: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 40,
    color: "#2C3E50",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    color: "#34495E",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    color: "#2C3E50",
  },
  // --- TOGGLE STYLES (NEW) ---
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E1E8EE',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleButtonActive: {
    backgroundColor: '#3498DB',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // --- BUTTON STYLES ---
  button: {
    backgroundColor: "#3498DB",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#3498DB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // --- RESULT STYLES ---
  resultContainer: {
    backgroundColor: "#FFFFFF",
    padding: 35,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E1E8EE",
  },
  resultLabel: {
    fontSize: 20,
    color: "#7F8C8D",
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 60,
    fontWeight: "900",
    color: "#2C3E50",
    marginBottom: 15,
  },
  categoryBadge: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tipTitle: { // NEW: Health Tips Title
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 25,
    marginBottom: 5,
  },
  tipText: { // NEW: Health Tips Text
    fontSize: 16,
    color: '#5D6D7E',
    textAlign: 'center',
    lineHeight: 22,
  },
  // --- REFERENCE GUIDE STYLES ---
  referenceContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#3498DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34495E",
  },
  referenceText: {
    fontSize: 15,
    color: "#5D6D7E",
    lineHeight: 24,
  },
  // --- HISTORY STYLES (NEW) ---
  historyContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  historyEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  historyBMI: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginRight: 8,
  },
  historyCategory: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  historyDetails: {
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  historySource: {
    fontSize: 12,
    color: '#AEB6BF',
  }
});