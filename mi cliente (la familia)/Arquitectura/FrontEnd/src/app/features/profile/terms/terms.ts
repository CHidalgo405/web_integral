import { Component, HostListener } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [Header, IconComponent],
  template: `
    <app-header title="Términos y Privacidad" [showBack]="true"></app-header>
    
    <div class="terms-page" id="terms-page">
      
      <!-- Sticky horizontal navigation index -->
      <div class="quick-nav-bar">
        <div class="quick-nav-scroll">
          @for (sec of sections; track sec.id) {
            <button type="button" class="nav-pill" (click)="scrollToSection(sec.id)">
              <app-icon [name]="sec.icon" size="14" />
              <span>{{ sec.name }}</span>
            </button>
          }
        </div>
      </div>

      <div class="terms-container">
        <p class="last-updated">Última actualización: 4 de Junio de 2026</p>
        
        <section id="section-1">
          <h2><app-icon name="help-circle" size="18" /> 1. Introducción y Aceptación de los Términos</h2>
          <p>Bienvenido a "Tiendita Maday" (en adelante, "la Aplicación", "Nosotros", "la Empresa"). Al descargar, acceder, navegar o utilizar esta Aplicación, usted (en adelante, "el Usuario" o "el Cliente") acepta expresamente y sin reservas estar sujeto a los presentes Términos y Condiciones, así como a nuestro Aviso de Privacidad Integral. Estos términos constituyen un contrato legalmente vinculante entre usted y "Tiendita Maday".</p>
          <p>Si no está de acuerdo con todas las condiciones aquí establecidas, debe abstenerse inmediatamente de utilizar la Aplicación y sus servicios.</p>
        </section>

        <section id="section-2">
          <h2><app-icon name="user" size="18" /> 2. Elegibilidad y Registro de Cuenta</h2>
          <p>Para hacer uso de los servicios de compra, el Usuario debe ser mayor de edad (18 años o más) y contar con capacidad legal para contratar. Los menores de edad solo podrán utilizar la Aplicación bajo la supervisión y consentimiento explícito de un padre o tutor legal.</p>
          <p>Al registrarse, el Usuario se compromete a:</p>
          <ul>
            <li>Proporcionar información verdadera, exacta, actual y completa sobre sí mismo.</li>
            <li>Mantener y actualizar de inmediato sus datos para que sigan siendo precisos y completos.</li>
            <li>Proteger la confidencialidad de su contraseña y ser el único responsable de todas las actividades que ocurran bajo su cuenta.</li>
          </ul>
          <p>Nos reservamos el derecho indiscutible de suspender, desactivar o cancelar cuentas que violen estos Términos, que contengan información falsa, o que estén involucradas en actividades sospechosas de fraude o suplantación de identidad.</p>
        </section>

        <section id="section-3">
          <h2><app-icon name="lock" size="18" /> 3. Aviso de Privacidad y Tipos de Datos Recopilados</h2>
          <p>La privacidad de nuestros Usuarios es una prioridad absoluta. Para poder brindar un servicio eficiente de venta y entrega de productos, recopilamos, almacenamos y procesamos diferentes categorías de datos personales. A continuación, detallamos exactamente qué datos recopilamos y para qué fines:</p>
          
          <h3>A. Tipos de Datos que Recopilamos</h3>
          <ul>
            <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, número de teléfono (móvil y/o fijo), dirección de correo electrónico y, en algunos casos, fecha de nacimiento para verificar la mayoría de edad. Estos datos son obligatorios para crear un perfil operativo en el sistema.</li>
            <li><strong>Datos de Ubicación y Entrega:</strong> Dirección física completa (calle, número interior/exterior, colonia, código postal, ciudad, estado), referencias del domicilio y, en caso de conceder permiso a la app, coordenadas geográficas (GPS). Estos datos se utilizan exclusivamente para calcular rutas logísticas y garantizar la entrega oportuna por parte de nuestros mensajeros.</li>
            <li><strong>Datos de Facturación y Pago:</strong> Información relacionada con su método de pago, que incluye el nombre del titular, dirección de facturación y los últimos 4 dígitos de su tarjeta o identificador de cuenta de plataformas de pago. 
              <div class="info-alert-box-terms">
                <app-icon name="lock" size="16" />
                <p><em>Nota importante: "Tiendita Maday" NO almacena directamente números de tarjetas de crédito/débito completos ni códigos de seguridad (CVV/CVC) en sus propios servidores. Todo el procesamiento se realiza mediante pasarelas de pago de terceros que cuentan con estrictas certificaciones PCI-DSS (estándar de seguridad de datos para la industria de tarjetas de pago).</em></p>
              </div>
            </li>
            <li><strong>Datos de Navegación, Uso y Dispositivo:</strong> Información técnica generada al interactuar con nuestra plataforma, como la dirección IP, modelo de dispositivo móvil, versión del sistema operativo, identificadores únicos del dispositivo (UUID), historial de búsqueda de productos dentro de la app, productos agregados al carrito, tiempos de sesión e interacciones en la interfaz. Utilizamos esta información mediante tecnologías de rastreo y analíticas internas.</li>
          </ul>

          <h3>B. Finalidad del Uso de los Datos (Por qué los usamos)</h3>
          <ul>
            <li><strong>Procesamiento y Gestión de Pedidos:</strong> Para cobrar sus compras de forma segura, emitir los comprobantes fiscales correspondientes y coordinar todo el flujo operativo de empaque y distribución hasta la puerta de su domicilio.</li>
            <li><strong>Atención al Cliente y Soporte:</strong> Para poder contactarlo de manera proactiva en caso de faltantes de inventario, problemas en la ruta de entrega, procesar sus devoluciones, aplicar garantías de productos y dar respuesta a cualquier duda o inconveniente técnico que presente.</li>
            <li><strong>Prevención de Fraudes e Integridad de la Plataforma:</strong> Los datos combinados de navegación, dispositivo y métodos de pago nos permiten implementar algoritmos anti-fraude que detectan transacciones inusuales o accesos no autorizados a su cuenta, protegiendo tanto el patrimonio de los usuarios como el de la empresa.</li>
            <li><strong>Mejora Continua y Personalización de la Experiencia:</strong> Al analizar los datos de uso y el historial de compras, nuestros sistemas pueden identificar errores de diseño en la app, optimizar el rendimiento de la plataforma y recomendarle productos, ofertas o categorías que se alineen mejor con sus preferencias personales.</li>
            <li><strong>Comunicaciones de mercadotecnia (sujetas a consentimiento):</strong> Para enviarle notificaciones o correos electrónicos con promociones exclusivas, ventas relámpago, códigos de descuento y boletines informativos. El Usuario conserva siempre el derecho a cancelar su suscripción a estas comunicaciones en la configuración de su perfil.</li>
          </ul>

          <h3>C. Derechos ARCO y Conservación de Datos</h3>
          <p>En estricto cumplimiento con las leyes de protección de datos aplicables, usted tiene el derecho irrevocable de Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO) al tratamiento de su información. Para ejercer cualquiera de estos derechos, puede abrir un ticket de soporte desde la sección de Ayuda de su perfil. Sus datos personales serán conservados de forma segura y encriptada únicamente durante el tiempo estrictamente necesario para cumplir con las finalidades descritas, resolver disputas y acatar nuestras obligaciones legales y fiscales aplicables. Al solicitar la eliminación de su cuenta, todos sus datos serán anonimizados o purgados permanentemente de nuestros servidores.</p>
        </section>

        <section id="section-4">
          <h2><app-icon name="shopping-cart" size="18" /> 4. Catálogo de Productos, Precios y Disponibilidad</h2>
          <p>Hacemos nuestro mayor esfuerzo tecnológico y operativo para que el catálogo digital exhibido sea preciso, no obstante:</p>
          <ul>
            <li><strong>Imágenes, Descripciones y Colores:</strong> Las fotografías son representaciones visuales ilustrativas. Las características, empacado y tonalidades físicas pueden variar ligeramente respecto a lo que usted percibe a través de la pantalla debido a configuraciones de color de los distintos dispositivos.</li>
            <li><strong>Gestión de Inventario:</strong> Toda publicación de producto está estrictamente condicionada a la disponibilidad física real en nuestro centro de distribución. Si por un desfase de inventario o alta demanda simultánea, un artículo comprado se reporta como agotado, se lo notificaremos a la brevedad y usted tendrá la opción de recibir un reemplazo sugerido de valor equivalente o un reembolso íntegro e inmediato.</li>
            <li><strong>Política de Precios y Errores Tipográficos:</strong> Todos los precios publicados ya incluyen el Impuesto al Valor Agregado (IVA) aplicable. Nos reservamos el pleno derecho de modificar los precios del catálogo sin notificación previa. En el caso excepcional y documentado de un error tipográfico o falla algorítmica en la plataforma que asigne un precio flagrantemente incorrecto (por ejemplo, valor $0.00 o cifras ridículamente bajas frente a su valor real de mercado), "Tiendita Maday" se reserva el derecho legítimo de cancelar el pedido en cualquier etapa, realizar el reembolso completo del dinero cobrado por error y notificar al usuario sobre la cancelación.</li>
          </ul>
        </section>

        <section id="section-5">
          <h2><app-icon name="truck" size="18" /> 5. Logística, Envíos y Transferencia de Riesgos</h2>
          <p>Nos comprometemos a entregar sus compras a la brevedad posible, operando bajo las siguientes normativas logísticas:</p>
          <ul>
            <li><strong>Tiempos Estimados y Flexibilidad:</strong> Las fechas y horarios de entrega informados en la Aplicación son aproximaciones. No somos civil ni comercialmente responsables por demoras causadas por circunstancias excepcionales de fuerza mayor (condiciones climáticas extremas, bloqueos viales, contingencias sanitarias, desastres naturales o fallas críticas en los proveedores de mensajería).</li>
            <li><strong>Transmisión Legal de Riesgo:</strong> El riesgo de pérdida, daño o robo de los productos adquiridos se transfiere de la Empresa al Usuario exactamente en el momento en que nuestro personal de entregas o socio logístico cede la posesión física del paquete en la dirección registrada. Al recibir, el Usuario o la persona en domicilio asume la entera responsabilidad de revisar el estado del paquete antes de aceptarlo.</li>
            <li><strong>Restricciones de Cobertura:</strong> "Tiendita Maday" delimita sus zonas de entrega operativas. Nos reservamos el derecho de cancelar un envío y reembolsar la compra si nuestro sistema logístico determina que el área destino se encuentra fuera de cobertura, resulta inaccesible o representa un alto riesgo de seguridad para nuestro personal.</li>
          </ul>
        </section>

        <section id="section-6">
          <h2><app-icon name="clock" size="18" /> 6. Devoluciones, Cancelaciones y Reembolsos</h2>
          <p>Nuestra política de devoluciones se rige bajo un marco estricto que equilibra la satisfacción del cliente con las normativas sanitarias y de salubridad:</p>
          <ul>
            <li><strong>Ventana para Solicitudes:</strong> El Cliente dispone legalmente de un plazo máximo e improrrogable de 7 (siete) días naturales contados a partir del acuse de recibo para solicitar y gestionar una devolución por insatisfacción o defecto de fábrica.</li>
            <li><strong>Criterios de Aceptación:</strong> Todo artículo sujeto a devolución debe encontrarse en estado prístino: sin signos evidentes de uso, desgaste, lavado o alteración. Es obligatorio que el producto retenga todas sus etiquetas, protectores plásticos, manuales, accesorios y sea enviado en su embalaje y caja original intacta.</li>
            <li><strong>Excepciones y Artículos No Elegibles (Venta Final):</strong> Por estricta normativa de sanidad y protección al consumidor, bajo ninguna circunstancia procesamos devoluciones ni cambios físicos para los siguientes tipos de productos: Alimentos, perecederos, bebidas, suplementos dietéticos, trajes de baño, lencería, cosméticos desellados y cualquier artículo de higiene y uso personal íntimo.</li>
            <li><strong>Proceso de Inspección y Reembolso:</strong> Una vez recibido el artículo en nuestro almacén central, nuestro departamento de control de calidad realizará una inspección que demorará un lapso de 1 a 3 días hábiles. Si la resolución de inspección es aprobatoria, emitiremos la orden de reembolso al mismo método de pago utilizado en la compra original. El tiempo en que los fondos se vean reflejados nuevamente en su cuenta depende en su totalidad de las políticas internas de la entidad financiera o banco emisor de su tarjeta (estimado regular: 5 a 15 días hábiles). Dependiendo de las circunstancias que motivan la devolución, los gastos de logística inversa (flete de retorno) podrían ser deducidos del monto total a reembolsar.</li>
          </ul>
        </section>

        <section id="section-7">
          <h2><app-icon name="gem" size="18" /> 7. Propiedad Intelectual, Marcas y Licencia Limitada</h2>
          <p>Todo el espectro de contenido alojado y visible en la Aplicación, abarcando (pero no limitándose a) textos informativos, bases de datos, código fuente, algoritmos, arquitectura de software, logotipos comerciales, gráficos, iconos de botones, diseño de interfaz (UI), componentes multimedia y arreglos tipográficos, es propiedad exclusiva de "Tiendita Maday" o está licenciado por proveedores autorizados, amparado bajo tratados internacionales y leyes de protección a la propiedad industrial y derechos de autor.</p>
          <p>Bajo la aceptación de estos términos, la Empresa otorga al Usuario una licencia sumamente limitada, revocable en cualquier instante, no exclusiva y no sublicenciable para acceder y hacer un uso estrictamente personal y no comercial de la Plataforma. Quedan absolutamente prohibidas prácticas como la extracción automatizada o minería de datos, descompilación, ingeniería inversa, copia no autorizada, venta o cualquier forma de explotación comercial de los sistemas y contenidos de esta Aplicación, sin un acuerdo firmado por los representantes legales de la Empresa.</p>
        </section>

        <section id="section-8">
          <h2><app-icon name="alert-triangle" size="18" /> 8. Exclusión de Garantías y Limitación General de Responsabilidad</h2>
          <p>El uso que el Cliente haga de la Plataforma es bajo su propia cuenta y riesgo. En la medida máxima permitida por el ordenamiento jurídico aplicable, la Aplicación se proporciona en un esquema "tal cual" (as is) y "según disponibilidad" (as available). "Tiendita Maday" rechaza expresamente otorgar garantías de cualquier especie, sean implícitas o explícitas, relativas a la infalibilidad operativa de la App o a la ausencia de código malicioso o virus en sus servidores, a pesar de nuestros agresivos protocolos de seguridad.</p>
          <p>De ninguna manera la Empresa, sus filiales, accionistas, directivos o trabajadores serán responsables legal o financieramente por cualquier clase de daños emergentes, punitivos, especiales, incidentales o consecuentes derivados del uso (o incapacidad operativa de uso) de la Plataforma, alteraciones del servicio, caídas de la pasarela de pago, robo de credenciales a causa del mal manejo por parte del Usuario, o lucro cesante.</p>
        </section>

        <section id="section-9">
          <h2><app-icon name="landmark" size="18" /> 9. Legislación, Jurisdicción y Cambios a los Términos</h2>
          <p>Los presentes Términos y Condiciones están constituidos y habrán de ser interpretados bajo las leyes vigentes aplicables en materia de comercio electrónico y protección de datos. Para cualquier controversia, litigio o interpretación derivados de este contrato, el Usuario se somete expresamente a la jurisdicción y competencia de los tribunales correspondientes de la jurisdicción primaria de la Empresa, renunciando a cualquier fuero que por su domicilio presente o futuro pudiese corresponderle.</p>
          <p>"Tiendita Maday" se reserva, de manera unilateral y definitiva, el derecho inalienable de actualizar, alterar o reemplazar partes sustanciales o accesorias de estos Términos en cualquier momento, a fin de adaptarse a nuevas legislaciones o políticas de negocio. Los cambios cobrarán vigor inmediato a partir de su publicación oficial en esta misma sección. Es imperativo que el Usuario revise periódicamente este documento. Continuar utilizando nuestra Plataforma tras cualquier actualización equivale a una ratificación y aceptación incondicional de los nuevos lineamientos.</p>
        </section>

        <section id="section-10">
          <h2><app-icon name="cookie" size="18" /> 10. Uso de Cookies, Balizas Web y Tecnologías de Rastreo</h2>
          <p>Nuestra Aplicación utiliza tecnologías de rastreo automatizado, tales como cookies de sesión, cookies persistentes, píxeles de seguimiento y web beacons, con el propósito fundamental de ofrecerle una experiencia de navegación fluida, segura y ultra personalizada.</p>
          <ul>
            <li><strong>Cookies Estrictamente Necesarias:</strong> Requeridas indispensablemente para el funcionamiento núcleo de la App (por ejemplo, mantener su sesión activa, recordar los artículos en su carrito de compras y procesar el checkout). Sin estas cookies, la Plataforma no puede funcionar.</li>
            <li><strong>Cookies de Rendimiento y Analíticas:</strong> Nos permiten cuantificar las visitas y fuentes de tráfico para poder evaluar y mejorar el rendimiento de nuestro sitio. Toda la información que recogen estas cookies es agregada y, por lo tanto, estrictamente anónima.</li>
            <li><strong>Cookies de Funcionalidad y Publicidad:</strong> Empleadas para recordar sus preferencias (idioma, región) y para construir un perfil sobre sus intereses a fin de mostrarle anuncios relevantes de "Tiendita Maday" en sitios de terceros. Usted puede configurar su dispositivo para bloquear estas cookies, aunque esto podría afectar negativamente su experiencia de compra.</li>
          </ul>
        </section>

        <section id="section-11">
          <h2><app-icon name="dollar-sign" size="18" /> 11. Cumplimiento Normativo: Prevención de Lavado de Dinero (PLD) y Conoce a tu Cliente (KYC)</h2>
          <p>En estricto apego a las leyes financieras internacionales y locales orientadas a la Prevención del Lavado de Dinero y Financiamiento al Terrorismo, "Tiendita Maday" se reserva el derecho absoluto de implementar controles de debida diligencia de clientes (políticas KYC).</p>
          <p>Si nuestro sistema de riesgo detecta patrones de compra anómalos, volúmenes de transacción injustificadamente altos, o discrepancias severas en la información de facturación, nos reservamos el derecho de retener el envío de los productos, cancelar el pedido, e incluso exigir al Cliente el envío de documentación adicional (como identificación oficial o comprobante de domicilio) para validar la legítimidad de los fondos. En caso de negativa, la cuenta será bloqueada permanentemente y reportada a las autoridades competentes si se considera necesario.</p>
        </section>

        <section id="section-12">
          <h2><app-icon name="tag" size="18" /> 12. Promociones, Cupones de Descuento y Programas de Lealtad</h2>
          <p>La Empresa podrá, de forma esporádica y a su sola discreción, ofrecer promociones, cupones de descuento, ventas nocturnas o programas de acumulación de puntos. Estas dinámicas estarán sujetas a las siguientes reglas restrictivas:</p>
          <ul>
            <li><strong>Uso Único y No Acumulable:</strong> Salvo que se indique explícitamente lo contrario por escrito, los códigos promocionales están limitados a un solo uso por cuenta de Cliente, por domicilio y por tarjeta bancaria, y no pueden combinarse con otras ofertas, rebajas o descuentos preexistentes en el catálogo.</li>
            <li><strong>Fechas de Caducidad y Agotamiento de Stock:</strong> Toda promoción tiene una vigencia temporal estricta y/o está limitada a un número determinado de unidades ("hasta agotar existencias"). Expirado el plazo o el stock, la oferta quedará inválida de pleno derecho, sin obligación de la Empresa de otorgar compensaciones.</li>
            <li><strong>Revocación de Beneficios:</strong> Nos reservamos el derecho de anular cupones o descontar puntos de lealtad si nuestros algoritmos detectan abusos del sistema, creación de cuentas múltiples por una sola persona física para acaparar descuentos, o cualquier otra violación al espíritu de la promoción.</li>
          </ul>
        </section>

        <section id="section-13">
          <h2><app-icon name="pencil" size="18" /> 13. Contenido Generado por el Usuario y Moderación</h2>
          <p>Los Usuarios pueden tener la posibilidad de publicar reseñas, calificaciones, comentarios, sugerencias o fotografías relacionadas con los productos adquiridos ("Contenido del Usuario"). Al publicar dicho contenido, usted declara que:</p>
          <ul>
            <li>Otorga a "Tiendita Maday" una licencia perpetua, irrevocable, mundial, libre de regalías y sublicenciable para usar, reproducir, modificar, adaptar, publicar, traducir, crear trabajos derivados, distribuir y mostrar dicho contenido en cualquier medio y con fines promocionales.</li>
            <li>El contenido publicado no es ilegal, obsceno, amenazante, difamatorio, invasivo de la privacidad, infractor de derechos de propiedad intelectual, ni contiene virus informáticos, campañas políticas, o cualquier forma de "spam".</li>
          </ul>
          <p>La Empresa actúa como un mero alojador de este contenido y no se hace responsable por las opiniones de los Usuarios. Nos reservamos el derecho (pero no la obligación) de monitorear, editar o eliminar de inmediato y sin previo aviso cualquier contenido que, a nuestra entera discreción, viole estas pautas o resulte perjudicial para nuestra comunidad o imagen de marca.</p>
        </section>

        <section id="section-14">
          <h2><app-icon name="clipboard" size="18" /> 14. Enlaces y Servicios de Terceros</h2>
          <p>La Aplicación puede contener enlaces (hipervínculos) incrustados que dirijan a sitios web, plataformas, pasarelas de pago o servicios de terceros que no son propiedad ni están controlados por "Tiendita Maday" (por ejemplo, enlaces a redes sociales, procesadores de pago como Stripe o PayPal, o servicios de paquetería como FedEx o DHL).</p>
          <p>No tenemos control alguno sobre las políticas de privacidad, los términos de servicio, ni las prácticas comerciales de estos sitios de terceros. En consecuencia, el Usuario reconoce y acepta que "Tiendita Maday" no será responsable, ni directa ni indirectamente, por ningún daño, pérdida económica, o vulneración de datos causada o supuestamente causada por el uso de cualquier contenido, bien o servicio disponible en dichas plataformas externas.</p>
        </section>

        <section id="section-15">
          <h2><app-icon name="shield" size="18" /> 15. Obligación de Indemnización</h2>
          <p>Como condición fundamental para el uso de esta Aplicación, el Usuario acepta defender, indemnizar y eximir de toda responsabilidad a "Tiendita Maday", sus empresas matrices, subsidiarias, afiliados, directivos, ejecutivos, empleados, agentes y proveedores, contra cualquier reclamación, demanda, pérdida, responsabilidad, costo o gasto (incluyendo honorarios razonables de abogados) que surjan de:</p>
          <ul>
            <li>El incumplimiento culposo o doloso de cualquiera de las cláusulas de los presentes Términos y Condiciones.</li>
            <li>La violación de cualquier ley local, estatal, nacional o internacional, o de los derechos de cualquier tercero (incluidos derechos de propiedad intelectual o privacidad).</li>
            <li>Cualquier uso fraudulento, malintencionado o ilícito que se haga de la cuenta del Usuario, ya sea por el propio Usuario o por un tercero que haya accedido a ella debido a la negligencia del Usuario al proteger sus credenciales.</li>
          </ul>
        </section>

        <section id="section-16">
          <h2><app-icon name="bolt" size="18" /> 16. Casos Fortuitos y Fuerza Mayor (Extendido)</h2>
          <p>"Tiendita Maday" quedará exenta de cualquier responsabilidad por el retraso, falla en la entrega de productos, o incumplimiento de sus obligaciones bajo estos Términos si dicho retraso o incumplimiento es causado por eventos masivos e imprevisibles que escapen a su control razonable. Estos eventos incluyen, sin carácter limitativo:</p>
          <p>Huelgas laborales, paros nacionales, disturbios civiles, guerras, actos de terrorismo, incendios, explosiones, fenómenos meteorológicos extremos (huracanes, terremotos, inundaciones), pandemias declaradas por las autoridades sanitarias, restricciones de movilidad impuestas por gobiernos locales o federales, cortes generalizados en las telecomunicaciones, caídas masivas de servidores de proveedores en la nube, o ciberataques a gran escala (ransomware, ataques DDoS) que inutilicen nuestras infraestructuras tecnológicas temporariamente.</p>
        </section>

        <section id="section-17">
          <h2><app-icon name="landmark" size="18" /> 17. Resolución de Controversias, Arbitraje Vinculante y Renuncia a Demandas Colectivas</h2>
          <p>Para agilizar la resolución de conflictos y reducir los costos legales, cualquier disputa, controversia o reclamo que surja de, o esté relacionado con estos Términos y Condiciones, el uso de la Aplicación, o los productos adquiridos a través de la misma, será resuelto en primera instancia a través de negociaciones directas y de buena fe con nuestro departamento legal por un periodo no menor a 30 días naturales.</p>
          <p><strong>Arbitraje Vinculante:</strong> En caso de no llegar a un acuerdo, la controversia se resolverá exclusivamente mediante arbitraje vinculante y confidencial, y no en un tribunal de justicia, administrado por las autoridades arbitrales competentes de la jurisdicción primaria de la Empresa, de conformidad con sus Reglas de Arbitraje Comercial.</p>
          
          <div class="warning-alert-box-terms">
            <app-icon name="alert-triangle" size="18" />
            <p><strong>RENUNCIA A DEMANDAS COLECTIVAS:</strong> USTED Y "TIENDITA MADAY" ACUERDAN EXPLÍCITAMENTE QUE CADA PARTE PUEDE PRESENTAR RECLAMACIONES CONTRA LA OTRA SOLAMENTE EN SU CAPACIDAD INDIVIDUAL, Y BAJO NINGUNA CIRCUNSTANCIA COMO DEMANDANTE O MIEMBRO DE UNA CLASE EN CUALQUIER PROCEDIMIENTO COLECTIVO, REPRESENTATIVO O DE ACCIÓN POPULAR.</p>
          </div>
        </section>

        <section id="section-18">
          <h2><app-icon name="plus" size="18" /> 18. Divisibilidad, Supervivencia y Renuncia</h2>
          <ul>
            <li><strong>Divisibilidad:</strong> Si cualquier disposición de estos Términos se considera ilegal, nula o, por cualquier motivo, inaplicable por un tribunal competente, dicha disposición se considerará separable del resto del contrato y no afectará la validez y aplicabilidad de las disposiciones restantes, las cuales mantendrán todo su vigor y efecto legal.</li>
            <li><strong>Supervivencia:</strong> Las obligaciones y responsabilidades de las partes incurridas antes de la fecha de terminación (incluyendo deudas, garantías, obligaciones de indemnización y limitaciones de responsabilidad) sobrevivirán a la terminación de este acuerdo a todos los efectos legales aplicables.</li>
            <li><strong>Renuncia:</strong> El hecho de que "Tiendita Maday" no ejerza o no haga cumplir inmediatamente algún derecho o disposición de estos Términos no constituirá una renuncia a dicho derecho o disposición en el futuro. Cualquier renuncia será válida únicamente si se realiza por escrito y está firmada por un representante legal autorizado de la Empresa.</li>
          </ul>
        </section>

        <section id="section-19">
          <h2><app-icon name="mail" size="18" /> 19. Notificaciones, Domicilio Legal y Contacto Oficial</h2>
          <p>Toda comunicación oficial, notificación legal o requerimiento dirigido a "Tiendita Maday" deberá presentarse por escrito y enviarse mediante correo certificado con acuse de recibo o entregarse personalmente en nuestro domicilio corporativo registrado.</p>
          <p>Para dudas, aclaraciones, ejercicio de derechos ARCO o soporte técnico relacionado con sus compras, ponemos a su disposición los siguientes canales de contacto estandarizados:</p>
          <ul>
            <li><strong>Centro de Ayuda Integrado:</strong> A través de la sección "Ayuda" dentro de la propia Aplicación.</li>
            <li><strong>Correo Electrónico de Soporte:</strong> soporte&#64;tienditamaday.com</li>
            <li><strong>Teléfono de Atención al Cliente:</strong> Disponible en días y horas hábiles según se indica en la plataforma.</li>
          </ul>
          <p>Al utilizar nuestra Aplicación, usted acepta irrevocablemente recibir notificaciones, acuerdos, divulgaciones y otras comunicaciones por vía electrónica (email o alertas push), confirmando que dichas comunicaciones electrónicas satisfacen cualquier requisito legal que exija que dichas comunicaciones se realicen "por escrito".</p>
        </section>
      </div>
    </div>

    <!-- Scroll to top button -->
    @if (showScrollTop) {
      <button class="scroll-top-btn" (click)="scrollToTop()">
        <app-icon name="chevron-left" size="18" />
      </button>
    }
  `,
  styles: [`
    .terms-page {
      padding: 0;
      background-color: var(--bg);
      min-height: 100vh;
      padding-bottom: 80px;
    }

    /* Sticky Horizontal Navigation Index */
    .quick-nav-bar {
      position: sticky;
      top: 48px;
      z-index: 40;
      background: var(--bg);
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
    }
    .quick-nav-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    }
    .quick-nav-scroll::-webkit-scrollbar {
      display: none;
    }
    .nav-pill {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 99px;
      border: 1px solid var(--border);
      background: var(--surface-raised);
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-pill:hover {
      background: var(--hover);
      border-color: var(--text-muted);
      color: var(--primary);
    }
    .nav-pill app-icon {
      color: inherit;
    }

    /* Terms main container */
    .terms-container {
      background: var(--surface);
      border-radius: 24px;
      padding: 24px;
      margin: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.04);
      border: 1px solid var(--border);
    }
    .last-updated {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 24px;
      font-style: italic;
      text-align: right;
    }
    
    section { 
      margin-bottom: 30px; 
      border-bottom: 1px dashed var(--border);
      padding-bottom: 24px;
    }
    section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    /* Headings inside content */
    h2 { 
      font-size: 1.15rem; 
      font-weight: 800; 
      color: var(--primary); 
      margin: 0 0 16px;
      font-family: var(--font-heading);
      letter-spacing: -0.3px;
      line-height: 1.35;
      display: flex;
      align-items: center;
    }
    h2 app-icon {
      margin-right: 8px;
      color: var(--primary);
    }
    
    h3 {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 20px 0 10px;
      font-family: var(--font-heading);
      border-left: 3px solid var(--accent);
      padding-left: 10px;
    }

    p { 
      font-size: 0.85rem; 
      color: var(--text-secondary); 
      line-height: 1.6; 
      margin: 0 0 14px; 
      text-align: justify;
    }
    ul {
      margin: 0 0 20px;
      padding-left: 20px;
    }
    li {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 10px;
      text-align: justify;
    }
    strong {
      color: var(--text-primary);
      font-weight: 700;
    }
    em {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    /* Warning disclaimer callout box */
    .warning-alert-box-terms {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: var(--danger-alpha);
      border: 1px solid rgba(225, 75, 50, 0.15);
      border-radius: 14px;
      padding: 14px;
      margin: 16px 0;
    }
    .warning-alert-box-terms app-icon {
      color: var(--danger);
      margin-top: 2px;
    }
    .warning-alert-box-terms p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--danger);
      line-height: 1.45;
      text-align: left;
    }

    /* Info Alert callout box */
    .info-alert-box-terms {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: var(--primary-alpha);
      border: 1px solid rgba(28, 84, 66, 0.15);
      border-radius: 14px;
      padding: 14px;
      margin: 16px 0;
    }
    .info-alert-box-terms app-icon {
      color: var(--primary);
      margin-top: 2px;
    }
    .info-alert-box-terms p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.45;
      text-align: left;
    }

    /* Scroll to top floating button */
    .scroll-top-btn {
      position: fixed;
      bottom: 24px;
      right: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      border: none;
      box-shadow: 0 4px 12px rgba(15, 42, 32, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 100;
    }
    .scroll-top-btn:hover {
      transform: translateY(-2px) scale(1.05);
      background: var(--primary-dark);
      box-shadow: 0 6px 16px rgba(15, 42, 32, 0.4);
    }
    .scroll-top-btn app-icon {
      transform: rotate(90deg); /* Left chevron rotated to point up */
      color: #fff;
    }
  `]
})
export class Terms {
  showScrollTop = false;

  sections = [
    { id: 'section-1', name: '1. Intro', icon: 'help-circle' },
    { id: 'section-2', name: '2. Registro', icon: 'user' },
    { id: 'section-3', name: '3. Privacidad', icon: 'lock' },
    { id: 'section-4', name: '4. Catálogo', icon: 'shopping-cart' },
    { id: 'section-5', name: '5. Logística', icon: 'truck' },
    { id: 'section-6', name: '6. Devoluciones', icon: 'clock' },
    { id: 'section-7', name: '7. Propiedad', icon: 'gem' },
    { id: 'section-8', name: '8. Garantías', icon: 'alert-triangle' },
    { id: 'section-9', name: '9. Leyes', icon: 'landmark' },
    { id: 'section-10', name: '10. Cookies', icon: 'cookie' },
    { id: 'section-11', name: '11. PLD / KYC', icon: 'dollar-sign' },
    { id: 'section-12', name: '12. Promos', icon: 'tag' },
    { id: 'section-13', name: '13. Contenido', icon: 'pencil' },
    { id: 'section-14', name: '14. Enlaces', icon: 'clipboard' },
    { id: 'section-15', name: '15. Obligación', icon: 'shield' },
    { id: 'section-16', name: '16. Fuerza Mayor', icon: 'bolt' },
    { id: 'section-17', name: '17. Conflictos', icon: 'landmark' },
    { id: 'section-18', name: '18. Validez', icon: 'plus' },
    { id: 'section-19', name: '19. Contacto', icon: 'mail' }
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.pageYOffset > 400;
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -110;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
