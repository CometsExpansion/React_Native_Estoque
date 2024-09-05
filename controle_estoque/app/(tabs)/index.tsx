import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet, ScrollView } from 'react-native';
import { Button as PaperButton, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductValue, setNewProductValue] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductValue, setEditProductValue] = useState('');
  const [editProductQuantity, setEditProductQuantity] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const storedProducts = await AsyncStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error('Erro ao carregar produtos', error);
      }
    };

    loadProducts();
  }, []);

  const saveProducts = async (productsToSave: any[]) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(productsToSave));
    } catch (error) {
      console.error('Erro ao salvar produtos', error);
    }
  };

  const addProduct = () => {
    if (newProductName.trim() && !isNaN(parseFloat(newProductValue)) && !isNaN(parseInt(newProductQuantity))) {
      const newProduct = { 
        id: Date.now().toString(), 
        name: newProductName, 
        value: parseFloat(newProductValue), 
        quantity: parseInt(newProductQuantity)
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      setNewProductName('');
      setNewProductValue('');
      setNewProductQuantity('');
    } else {
      Alert.alert('Erro', 'Por favor, insira um nome, valor e quantidade válidos para o produto');
    }
  };

  const editProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setEditingProduct(id);
      setEditProductName(product.name);
      setEditProductValue(product.value.toString());
      setEditProductQuantity(product.quantity.toString());
    }
  };

  const updateProduct = () => {
    if (editingProduct) {
      const updatedProducts = products.map(p => 
        p.id === editingProduct ? { 
          ...p, 
          name: editProductName, 
          value: parseFloat(editProductValue), 
          quantity: parseInt(editProductQuantity)
        } : p
      );
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      setEditingProduct(null);
      setEditProductName('');
      setEditProductValue('');
      setEditProductQuantity('');
    }
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciamento de Estoque</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do Produto"
            value={editingProduct ? editProductName : newProductName}
            onChangeText={text => editingProduct ? setEditProductName(text) : setNewProductName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Valor do Produto"
            value={editingProduct ? editProductValue : newProductValue}
            keyboardType="numeric"
            onChangeText={text => editingProduct ? setEditProductValue(text) : setNewProductValue(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade em Estoque"
            value={editingProduct ? editProductQuantity : newProductQuantity}
            keyboardType="numeric"
            onChangeText={text => editingProduct ? setEditProductQuantity(text) : setNewProductQuantity(text)}
          />
          <PaperButton 
            mode="contained" 
            onPress={editingProduct ? updateProduct : addProduct} 
            style={styles.submitButton}
          >
            {editingProduct ? 'Atualizar' : 'Adicionar'}
          </PaperButton>
        </View>

        <View style={styles.gridContainer}>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Title 
                  title={item.name} 
                  subtitle={`R$${item.value.toFixed(2)} | Qty: ${item.quantity}`} 
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                />
                <Card.Actions style={styles.cardActions}>
                  <PaperButton mode="outlined" onPress={() => editProduct(item.id)} style={styles.cardButton}>
                    Editar
                  </PaperButton>
                  <PaperButton mode="outlined" onPress={() => deleteProduct(item.id)} style={styles.cardButton}>
                    Excluir
                  </PaperButton>
                </Card.Actions>
              </Card>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    backgroundColor: '#4a90e2',
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  gridContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardActions: {
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  cardButton: {
    marginHorizontal: 8,
  },
});

//