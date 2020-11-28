

def build_model(shape=(68,68,1)):
    '''
    '''
    input = Input(shape)
    x = Conv2D(16,(2,2),padding='same',activation=LeakyReLU())(input)
    x = Conv2D(1,(2,2),padding='same',activation=LeakyReLU())(x)
    x = Flatten()(x)
    x = Dense(2048,activation='linear')(x)
    x = Dense(2048,activation='linear')(x)
    x = Dense(2048,activation='linear')(x)
    x = Dropout(0.25)(x)
    output = Dense(7, activation='softmax')(x)
    model = Model(input, output)
    optimizer = Adam(learning_rate=1e-3)
    model.compile(loss='categorical_crossentropy',optimizer=optimizer,metrics=['accuracy'])
    return model
