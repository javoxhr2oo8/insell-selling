<script setup>
import { db } from '~/server/db';
import { ref, computed, onMounted } from 'vue';

const activeSection = ref('INDEX');

const openSearchSwitch = ref(false)
const AllProductsget = ref({})

const SectionIndexSwitch = computed({
    get: () => activeSection.value === 'INDEX',
    set: (val) => { if (!val) activeSection.value = 'CLOSED' }
})

const SectionIndexConfirmSwitch = computed({
    get: () => activeSection.value === 'CONFIRM',
    set: (val) => { if (!val) activeSection.value = 'INDEX' }
})

const sectionDiscountSwitch = computed({
    get: () => activeSection.value === 'DISCOUNT',
    set: (val) => { if (!val) activeSection.value = 'CONFIRM' }
})

const nasiyaSectionSwitch = computed({
    get: () => activeSection.value === 'NASIYA',
    set: (val) => { if (!val) activeSection.value = 'CONFIRM' }
})

const lastBtnBackToOpenSectionSwitch = computed(() => activeSection.value === 'CLOSED')

const getAllProducts = async () => {
    const localData = await db.products.get('all_products');
    if (localData) {
        AllProductsget.value = localData.list
    }
}

function swicthFuncForConfirm() {
    activeSection.value = 'CONFIRM'
}

function swicthFuncBackFromConfirm() {
    activeSection.value = 'INDEX'
}

function closeAllSectionsFunc() {
    activeSection.value = 'CLOSED'
}

function openFirstSection() {
    activeSection.value = 'INDEX'
}

function openDiscountSection() {
    activeSection.value = 'DISCOUNT'
}

function backFromDiscountFunc() {
    activeSection.value = 'CONFIRM'
}

function openNasiyaSectionSwitch() {
    activeSection.value = 'NASIYA'
}

onMounted(() => {
    getAllProducts()
})
</script>

<template>
    <SectionIndex v-model="SectionIndexSwitch">
        <template #back-btn>
            <button @click="closeAllSectionsFunc()">
                <img src="../../assets/images/png/back-icon-orange.png" alt="">
            </button>
        </template>

        <span class="regular-products-title">Doimiy mahsulotlar:</span>
        <div class="regualr-products-wrapper">
            <RegularProduct v-for="item in AllProductsget" :key="item.id" :product="item" />
        </div>

        <template #footer-actions>
            <button class="payment-footer-btn" @click="swicthFuncForConfirm()">To'lov</button>
            <div class="footer-bottom-actions">
                <button @click="openDiscountSection()"><i class="fas fa-tag"></i></button>
                <button @click="openNasiyaSectionSwitch()"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <SectionIndex v-model="SectionIndexConfirmSwitch">
        <template #back-btn>
            <button @click="swicthFuncBackFromConfirm()">
                <img src="../../assets/images/png/back-icon-orange.png" alt="">
            </button>
        </template>

        <div class="users-info">
            <button @click="openSearchSwitch = !openSearchSwitch">Mijozlar</button>
            <div class="search-users-info-search" v-if="openSearchSwitch">
                <label for="info-users">Qidiruv</label>
                <input id="info-users" type="text">
            </div>

            <div class="users-info-items regualr-products-wrapper" v-if="false">
                <div class="user-info-item" v-for="item in 5" :key="item">
                    <h2>Nurislombek</h2>
                    <h2>90 785 2420</h2>
                </div>
            </div>
        </div>

        <div class="sections-payment">
            <span>To'lov</span>
            <div class="sections-payment-inputs">
                <div class="sections-payment-input">
                    <input type="text" placeholder="Naxt">
                    <button><i class="fas fa-magnet"></i></button>
                </div>

                <div class="sections-payment-input">
                    <input type="text" placeholder="Plastik">
                    <button><i class="fas fa-magnet"></i></button>
                </div>
            </div>
        </div>

        <template #footer-actions>
            <button class="payment-footer-btn">Tasdiqlash</button>
            <div class="footer-bottom-actions">
                <button @click="openDiscountSection()"><i class="fas fa-tag"></i></button>
                <button @click="openNasiyaSectionSwitch()"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <SectionIndex v-model="sectionDiscountSwitch">
        <template #back-btn>
            <button @click="backFromDiscountFunc()">
                <img src="../../assets/images/png/back-icon-orange.png" alt="">
            </button>
        </template>

        <div class="users-info">
            <button @click="openSearchSwitch = !openSearchSwitch">Mijozlar</button>
            <div class="search-users-info-search" v-if="openSearchSwitch">
                <label for="info-users">Qidiruv</label>
                <input id="info-users" type="text">
            </div>
        </div>

        <div class="sections-payment">
            <span>Chegirma</span>
            <div class="sections-payment-inputs">
                <div class="sections-payment-input">
                    <input type="text" placeholder="Summada">
                    <button><span>so'm</span></button>
                </div>

                <div class="sections-payment-input">
                    <input type="text" placeholder="Plastik">
                    <button><span>%</span></button>
                </div>
            </div>

            <div class="discount-cards">
                <div class="discount-card" v-for="val in ['-5%', '-10%', '-15%', '-20%', '-25%', '-30%']" :key="val">
                    <h2>{{ val }}</h2>
                </div>
            </div>
        </div>

        <template #footer-actions>
            <button class="payment-footer-btn">Tasdiqlash</button>
            <div class="footer-bottom-actions">
                <button class="section-active"><i class="fas fa-tag"></i></button>
                <button @click="openNasiyaSectionSwitch()"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <SectionIndex v-model="nasiyaSectionSwitch">
        <template #back-btn>
            <button @click="backFromDiscountFunc()">
                <img src="../../assets/images/png/back-icon-orange.png" alt="">
            </button>
        </template>

        <div class="users-info">
            <button @click="openSearchSwitch = !openSearchSwitch">Mijozlar</button>
            <div class="search-users-info-search" v-if="openSearchSwitch">
                <label for="info-users">Qidiruv</label>
                <input id="info-users" type="text">
            </div>
        </div>

        <div class="sections-payment">
            <span>Nasiya</span>
            <div class="sections-payment-inputs">
                <div class="sections-payment-input">
                    <input type="text" placeholder="Naxt">
                    <button><i class="fas fa-magnet"></i></button>
                </div>

                <div class="sections-payment-input">
                    <input type="text" placeholder="Plastik">
                    <button><i class="fas fa-magnet"></i></button>
                </div>
            </div>
        </div>

        <div class="nasiya">
            <span>Nasiya: 60 000 so’m</span>
            <div class="nasiya-input-wrapper">
                <input type="date">
                <button><i class="fas fa-calendar"></i></button>
            </div>
        </div>

        <template #footer-actions>
            <button class="payment-footer-btn">Tasdiqlash</button>
            <div class="footer-bottom-actions">
                <button @click="openDiscountSection()"><i class="fas fa-tag"></i></button>
                <button class="section-active"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <button class="open-section-btn" v-if="lastBtnBackToOpenSectionSwitch" @click="openFirstSection()">
        <img src="../../assets/images/png/back-icon.png" alt="">
    </button>
</template>

<style lang="scss" scoped>
.regular-products-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 0;
    font-weight: 600;
    color: rgba(104, 103, 103, 0.596);
    font-size: 32px;
}

.regualr-products-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: auto;
    height: 400px;
    padding: 10px;
}

.regualr-products-wrapper::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.regualr-products-wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.regualr-products-wrapper::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
    border: 2px solid #f1f1f1;
}

.regualr-products-wrapper::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.open-section-btn {
    height: 75vh;
    margin-top: 26px;
    padding: 0 15px;
    border-radius: 5px;
    background: var(--pr-color);
    border: none;
    margin-right: 18px;
    cursor: pointer;
    transition: all .2s ease;

    &:hover {
        opacity: 0.7;
    }

    &:active {
        transform: scale(99%);
    }
}

.users-info {
    margin-top: 15px;
    position: relative;

    button {
        width: 100%;
        padding: 10px;
        font-size: 25px;
        background: transparent;
        border: 1px solid #c9c9c9;
        border-radius: 10px;
        color: #c9c9c9;
        cursor: pointer;
        transition: all .2s ease;

        &:hover {
            opacity: 0.8;
        }

        &:active {
            transform: scale(98%);
        }
    }

    .search-users-info-search {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;

        label {
            color: #c9c9c9;
        }

        input {
            background: var(--bg-color);
            border: 1px solid #c9c9c9;
            padding: 15px;
            outline: none;
            color: var(--dark-color);
            font-size: 20px;
            border-radius: 10px;
        }
    }
}

.users-info-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 260px;
    margin-top: 20px;
    overflow: auto;
    position: absolute;
    width: 100%;
    background: var(--bg-color);
    padding: 15px;
    border-radius: 10px;

    .user-info-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 10px;
        border: 1px solid #c9c9c9;

        h2 {
            font-size: 20px;
            color: #c9c9c9;
            padding: 15px;
        }
    }
}

.sections-payment {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;

    span {
        font-weight: 600;
        font-size: 33px;
        color: var(--pr-color);
    }

    .sections-payment-inputs {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 13px;
        margin-top: 20px;

        .sections-payment-input {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;

            input {
                width: 100%;
                padding: 10px;
                font-weight: 600;
                font-size: 24px;
                color: #c9c9c9;
                border: 1px solid #c9c9c9;
                background: none;
                outline: none;
                border-radius: 10px;
            }

            button {
                padding: 10px;
                background: none;
                border: 1px solid #c9c9c9;
                cursor: pointer;
                border-radius: 10px;

                span {
                    width: 50px;
                    padding: 2px;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--dark-color);
                }

                i {
                    font-size: 28px;
                    color: #c9c9c9;
                }
            }
        }
    }
}

.discount-cards {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 20px;

    .discount-card {
        width: 100%;
        padding: 15px;
        border: 1px solid #c9c9c9;
        color: #c9c9c9;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        cursor: pointer;
        transition: all .2s ease;

        &:hover {
            opacity: 0.9;
            background: var(--pr-color);
            color: #fff;
        }

        &:active {
            transform: scale(98%);
        }
    }
}

.section-active {
    background: var(--pr-color) !important;

    i {
        color: #fff !important;
    }
}

.nasiya {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    span {
        font-size: 25px;
        color: var(--pr-color);
    }

    .nasiya-input-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 5px;

        input {
            padding: 10px;
            width: 100%;
            font-size: 20px;
            border-radius: 10px;
            border: 1px solid #c9c9c9;
            background: transparent;
            color: #c9c9c9;

            &::-webkit-calendar-picker-indicator {
                cursor: pointer;
                filter: invert(1);
            }
        }

        button {
            padding: 10px 13px;
            border: 1px solid #c9c9c9;
            background: none;
            border-radius: 10px;

            i {
                font-size: 27px;
                color: #c9c9c9;
            }
        }
    }
}
</style>