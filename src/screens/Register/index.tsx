import React, {useState, useEffect} from "react";
import {Alert, Keyboard, Modal, TouchableWithoutFeedback} from 'react-native';
import * as Yup from 'yup';
import {yupResolver} from  '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import uuid from 'react-native-uuid';

import { Button } from "../../components/Forms/Button";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";
import { Input } from "../../components/Forms/Input";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";
import { CategorySelect } from "../CatergorySelect";
import { InputForm } from "../../components/Forms/InputForm";
import { 
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes
} from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface FormData {
    [name: string]: any;
    amount: string;

}

const schema = Yup.object().shape({
    name: Yup.string().required('Name é obrigatorio'),
    amount: Yup
    .number()
    .typeError('Informe um valor numérico')
    .positive('O valor não pode ser negativo')
    .required('O valor é obrigatório')
});

export function Register(){
    const [transactionType, setTransactionType] = useState('');
    const [ categoryModalOpen, setCategoryModalOpen ] = useState(false);
    
    const dataKey = '@gofinances:transactions';

    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria'
    });

    const navegation = useNavigation();

    const {
        control,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm({
        resolver: yupResolver(schema)
    });

    function handleTransactionsTypeSelect(type: 'positive' | 'negative'){
        setTransactionType(type);
    }

    function handleCloseSelectCategoryModal(){
        setCategoryModalOpen(false);
    }

    function handleOpenSelectCategoryModal(){
        setCategoryModalOpen(true);
    }


    async function handleRegister(form: Partial<FormData>){

        if(!transactionType) 
            return Alert.alert('Selecione o tipo da transação');
        
        if(category.key === 'category') 
            return Alert.alert('Selecione uma categoria');

        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form .amount,
            type: transactionType,
            category: category.key,
            date: new Date()
        }
        

        try {
            const data = await AsyncStorage.getItem(dataKey);
            const currentData = data ? JSON.parse(data): [];

            const dataFormatted = [
                ...currentData, newTransaction
            ];

            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted!));

            reset();
            setTransactionType('');
            setCategory({
                key: 'category',
                name: 'Categoria'
            });

            navegation.navigate('Listagem');

        }catch(error){
            console.log(error);
            Alert.alert("Não foi possível salvar");
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>
                <Form>
                    <Fields>
                        <InputForm 
                            control={control} 
                            name="name" 
                            placeholder="Nome" 
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            error={errors.name && errors.name.message}
                        />
                        <InputForm control={control} name="amount" placeholder="Preço" keyboardType="numeric" error={errors.amount && errors.amount.message}/>

                        <TransactionsTypes>
                            <TransactionTypeButton 
                            type="up" 
                            title="Income" 
                            onPress={() => handleTransactionsTypeSelect('positive')}
                            isActive={transactionType === 'positive'}
                            />
                            <TransactionTypeButton 
                            type="down" 
                            title="Outcome" 
                            onPress={() => handleTransactionsTypeSelect('negative')}
                            isActive={transactionType === 'negative'}
                            />
                        </TransactionsTypes>
                        <CategorySelectButton 
                            title={category.name}
                            onPress={handleOpenSelectCategoryModal}
                        />
                    </Fields>
                    <Button title="Enviar" onPress={handleSubmit(handleRegister)}/>
                </Form>
                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                    category={category}
                    setCategory={setCategory}
                    closeSelectCategory={handleCloseSelectCategoryModal}  
                    />
                </Modal>
            </Container>
        </TouchableWithoutFeedback>
    );
}