import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Building,
  Heart,
  Droplets,
  Wheat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/register';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/staff';
      default:
        return '/dashboard';
    }
  };

  const getStartedText = user ? 'Go to Dashboard' : t('landing.hero.getStarted');
  const loginText = user ? 'Switch Account' : t('landing.hero.login');
  const loginLink = user ? '/login' : '/login';

  const features = [
    {
      icon: Shield,
      title: t('landing.features.secure.title'),
      description: t('landing.features.secure.description'),
    },
    {
      icon: Clock,
      title: t('landing.features.fast.title'),
      description: t('landing.features.fast.description'),
    },
    {
      icon: Users,
      title: t('landing.features.mobile.title'),
      description: t('landing.features.mobile.description'),
    },
    {
      icon: Users,
      title: t('landing.features.citizen.title'),
      description: t('landing.features.citizen.description'),
    },
  ];

  const services = [
    {
      name: 'Health',
      icon: Heart,
      description: 'Healthcare services and medical certificates',
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Housing',
      icon: Building,
      description: 'Housing assistance and property services',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Agriculture',
      icon: Wheat,
      description: 'Agricultural support and farmer services',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Water & Sanitation',
      icon: Droplets,
      description: 'Water supply and sanitation services',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      name: 'Infrastructure',
      icon: SettingsIcon,
      description: 'Infrastructure development and maintenance',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Public Documentation',
      icon: FileText,
      description: 'Official documents and certificates',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Women & Child Welfare',
      icon: Shield,
      description: 'Women and child development programs',
      color: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Education',
      icon: Users,
      description: 'Educational services and scholarships',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Transport',
      icon: ArrowRight,
      description: 'Transportation and mobility services',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const stats = [
    { number: '10,000+', label: t('landing.stats.citizensServed') },
    { number: '9+', label: t('landing.stats.servicesAvailable') },
    { number: '98%', label: t('landing.stats.successRate') },
    { number: '24/7', label: t('landing.stats.supportAvailable') },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t('landing.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {t('landing.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={getDashboardLink()}
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  {getStartedText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to={loginLink}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
                >
                  {loginText}
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-lg shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Digital Services</h3>
                    <p className="text-gray-600">Available 24/7</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {services.slice(0, 4).map((service, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.services.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.services.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center group cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={getDashboardLink()}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                {user ? 'Go to Dashboard' : t('landing.cta.register')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to={user ? "/logout" : "/login"}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
              >
                {user ? 'Switch Account' : t('landing.cta.alreadyAccount')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;